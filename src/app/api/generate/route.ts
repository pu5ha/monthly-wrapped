import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getTopTracks, getTopArtists } from "@/lib/spotify";
import { generateWrapBackground, generateGenreSummary } from "@/lib/nanoBanana";
import { composeFinalImage } from "@/lib/imageComposite";
import { createSupabaseServer } from "@/lib/supabase-server";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "true";

  const now = new Date();
  const testMode = process.env.TEST_MODE === "true";

  // Check if it's the first 7 days of the month (skip in test mode)
  if (!testMode && now.getDate() > 7) {
    return NextResponse.json(
      { error: "Monthly Wrapped can only be generated in the first 7 days of the month." },
      { status: 400 }
    );
  }

  const wrapMonth = now.getMonth() === 0 ? 12 : now.getMonth();
  const wrapYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const monthName = MONTH_NAMES[wrapMonth - 1];

  const supabase = createSupabaseServer();

  // Get user
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("spotify_id", session.spotifyId)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check if wrap already exists
  const { data: existingWrap } = await supabase
    .from("wraps")
    .select("id, image_url")
    .eq("user_id", user.id)
    .eq("month", wrapMonth)
    .eq("year", wrapYear)
    .single();

  if (existingWrap && !force) {
    return NextResponse.json({
      wrap: existingWrap,
      message: "Wrap already generated for this month",
    });
  }

  if (existingWrap && force) {
    await supabase.from("wraps").delete().eq("id", existingWrap.id);
  }

  try {
    const [topTracks, topArtists] = await Promise.all([
      getTopTracks(session.accessToken, 50),
      getTopArtists(session.accessToken, 50),
    ]);

    // Generate genre from full 50 items
    const genre = await generateGenreSummary(
      topArtists.map((a) => ({ name: a.name, genres: a.genres })),
      topTracks.map((t) => ({ name: t.name }))
    );

    const wrapData = {
      month: monthName,
      year: wrapYear,
      topTracks: topTracks.slice(0, 5).map((t) => ({ name: t.name })),
      topArtists: topArtists.slice(0, 5).map((a) => ({ name: a.name })),
      genre,
    };

    // Fetch #1 artist's photo from Spotify CDN
    const artistPhotoUrl = topArtists[0]?.images[0]?.url;
    let artistPhotoBuffer: Buffer;
    if (artistPhotoUrl) {
      const photoRes = await fetch(artistPhotoUrl);
      artistPhotoBuffer = Buffer.from(await photoRes.arrayBuffer());
    } else {
      // Fallback: solid circle if no photo available
      artistPhotoBuffer = await (await import("sharp")).default({
        create: { width: 200, height: 200, channels: 4, background: { r: 50, g: 50, b: 50, alpha: 1 } },
      }).png().toBuffer();
    }

    const aiImage = await generateWrapBackground(wrapData);
    const finalImage = await composeFinalImage(aiImage, artistPhotoBuffer, wrapData);

    const fileName = `${session.spotifyId}/${wrapYear}-${String(wrapMonth).padStart(2, "0")}.png`;

    const { error: uploadError } = await supabase.storage
      .from("wraps")
      .upload(fileName, finalImage, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      );
    }

    const { data: publicUrl } = supabase.storage
      .from("wraps")
      .getPublicUrl(fileName);

    // Cache-bust the URL so CDN serves the fresh image
    const imageUrl = `${publicUrl.publicUrl}?v=${Date.now()}`;

    const trackData = topTracks.map((t) => ({
      name: t.name,
      artist: t.artists.map((a) => a.name).join(", "),
      albumArt: t.album.images[0]?.url ?? "",
      spotifyUrl: t.external_urls.spotify,
    }));

    const artistData = topArtists.map((a) => ({
      name: a.name,
      imageUrl: a.images[0]?.url ?? "",
      spotifyUrl: a.external_urls.spotify,
    }));

    const { data: wrap, error: wrapError } = await supabase
      .from("wraps")
      .insert({
        user_id: user.id,
        month: wrapMonth,
        year: wrapYear,
        image_url: imageUrl,
        top_tracks: trackData,
        top_artists: artistData,
        genre,
      })
      .select()
      .single();

    if (wrapError) {
      console.error("Wrap save error:", wrapError);
      return NextResponse.json(
        { error: "Failed to save wrap" },
        { status: 500 }
      );
    }

    return NextResponse.json({ wrap });
  } catch (error: unknown) {
    console.error("Generate error:", error);
    const err = error as { status?: number; message?: string };
    const isRateLimit = err.status === 429;
    return NextResponse.json(
      {
        error: isRateLimit
          ? "AI image generation rate limit hit. Please wait a minute and try again."
          : `Failed to generate wrap: ${err.message ?? "Unknown error"}`,
      },
      { status: isRateLimit ? 429 : 500 }
    );
  }
}
