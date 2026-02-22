import { NextRequest, NextResponse } from "next/server";

const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;
const SUPABASE_DOMAIN = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

export async function POST(req: NextRequest) {
  if (!IMGUR_CLIENT_ID) {
    return NextResponse.json(
      { error: "Imgur client ID not configured" },
      { status: 500 }
    );
  }

  const { imageUrl } = await req.json();

  if (
    !imageUrl ||
    typeof imageUrl !== "string" ||
    !SUPABASE_DOMAIN ||
    !imageUrl.startsWith(`https://${SUPABASE_DOMAIN}`)
  ) {
    return NextResponse.json(
      { error: "Invalid image URL" },
      { status: 400 }
    );
  }

  try {
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch image" },
        { status: 500 }
      );
    }

    const buffer = Buffer.from(await imageRes.arrayBuffer());
    const base64 = buffer.toString("base64");

    const imgurRes = await fetch("https://api.imgur.com/3/image", {
      method: "POST",
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: base64, type: "base64" }),
    });

    if (!imgurRes.ok) {
      const err = await imgurRes.text();
      console.error("Imgur upload failed:", err);
      return NextResponse.json(
        { error: "Imgur upload failed" },
        { status: 500 }
      );
    }

    const data = await imgurRes.json();
    return NextResponse.json({ link: data.data.link });
  } catch (err) {
    console.error("Imgur proxy error:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
