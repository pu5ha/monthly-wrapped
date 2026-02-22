import { redirect } from "next/navigation";
import { getSpotifyAuthUrl } from "@/lib/auth";

export async function GET() {
  redirect(getSpotifyAuthUrl());
}
