import type { SpotifyTrack, SpotifyArtist } from "@/types";

const SPOTIFY_API = "https://api.spotify.com/v1";

async function spotifyFetch<T>(
  endpoint: string,
  accessToken: string
): Promise<T> {
  const res = await fetch(`${SPOTIFY_API}${endpoint}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      `Spotify API error ${res.status}: ${JSON.stringify(error)}`
    );
  }

  return res.json();
}

export async function getTopTracks(
  accessToken: string,
  limit = 5,
  timeRange = "short_term"
): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch<{ items: SpotifyTrack[] }>(
    `/me/top/tracks?limit=${limit}&time_range=${timeRange}`,
    accessToken
  );
  return data.items;
}

export async function getTopArtists(
  accessToken: string,
  limit = 5,
  timeRange = "short_term"
): Promise<SpotifyArtist[]> {
  const data = await spotifyFetch<{ items: SpotifyArtist[] }>(
    `/me/top/artists?limit=${limit}&time_range=${timeRange}`,
    accessToken
  );
  return data.items;
}
