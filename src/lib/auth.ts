import { cookies } from "next/headers";
import { createSupabaseServer } from "./supabase-server";

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_ME_URL = "https://api.spotify.com/v1/me";
const SCOPES = "user-top-read user-read-private user-read-email";

export const REDIRECT_URI = `${process.env.AUTH_URL}/api/auth/callback`;

const SESSION_COOKIE = "mw_session";

interface SessionData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  spotifyId: string;
  name: string;
  email: string;
  image: string;
}

export function getSpotifyAuthUrl(): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    show_dialog: "true",
  });
  return `${SPOTIFY_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCode(code: string): Promise<SessionData> {
  // Exchange code for tokens
  const tokenRes = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const tokens = await tokenRes.json();
  if (!tokenRes.ok) {
    throw new Error(`Token exchange failed: ${JSON.stringify(tokens)}`);
  }

  // Fetch user profile
  const profileRes = await fetch(SPOTIFY_ME_URL, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const profile = await profileRes.json();

  // Upsert user in Supabase
  const supabase = createSupabaseServer();
  await supabase.from("users").upsert(
    {
      spotify_id: profile.id,
      display_name: profile.display_name,
      email: profile.email,
      avatar_url: profile.images?.[0]?.url,
    },
    { onConflict: "spotify_id" }
  );

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Math.floor(Date.now() / 1000 + tokens.expires_in),
    spotifyId: profile.id,
    name: profile.display_name || "",
    email: profile.email || "",
    image: profile.images?.[0]?.url || "",
  };
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresAt: number; refreshToken: string }> {
  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.SPOTIFY_CLIENT_ID!,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
    }),
  });

  const tokens = await res.json();
  if (!res.ok) throw new Error("Failed to refresh token");

  return {
    accessToken: tokens.access_token,
    expiresAt: Math.floor(Date.now() / 1000 + tokens.expires_in),
    refreshToken: tokens.refresh_token ?? refreshToken,
  };
}

export async function setSession(data: SessionData): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify(data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE);
  if (!cookie) return null;

  try {
    const session: SessionData = JSON.parse(cookie.value);

    // Check if token is expired and refresh
    if (Date.now() / 1000 > session.expiresAt - 300) {
      try {
        const refreshed = await refreshAccessToken(session.refreshToken);
        session.accessToken = refreshed.accessToken;
        session.expiresAt = refreshed.expiresAt;
        session.refreshToken = refreshed.refreshToken;
        await setSession(session);
      } catch {
        // Refresh failed, clear session
        await clearSession();
        return null;
      }
    }

    return session;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
