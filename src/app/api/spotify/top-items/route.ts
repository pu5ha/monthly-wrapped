import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getTopTracks, getTopArtists } from "@/lib/spotify";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [topTracks, topArtists] = await Promise.all([
      getTopTracks(session.accessToken),
      getTopArtists(session.accessToken),
    ]);

    return NextResponse.json({ topTracks, topArtists });
  } catch (error) {
    console.error("Spotify API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Spotify data" },
      { status: 500 }
    );
  }
}
