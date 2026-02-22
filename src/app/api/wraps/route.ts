import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseServer();

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("spotify_id", session.spotifyId)
    .single();

  if (!user) {
    return NextResponse.json({ wraps: [] });
  }

  const { data: wraps } = await supabase
    .from("wraps")
    .select("*")
    .eq("user_id", user.id)
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  return NextResponse.json({ wraps: wraps ?? [] });
}
