export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  artists: { name: string; id: string }[];
  album: {
    name: string;
    images: { url: string; width: number; height: number }[];
  };
  external_urls: { spotify: string };
  duration_ms: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  uri: string;
  images: { url: string; width: number; height: number }[];
  external_urls: { spotify: string };
  genres: string[];
}

export interface TopItemsResponse {
  topTracks: SpotifyTrack[];
  topArtists: SpotifyArtist[];
}

export interface Wrap {
  id: string;
  user_id: string;
  month: number;
  year: number;
  image_url: string;
  top_tracks: {
    name: string;
    artist: string;
    albumArt: string;
    spotifyUrl: string;
  }[];
  top_artists: {
    name: string;
    imageUrl: string;
    spotifyUrl: string;
  }[];
  genre?: string;
  created_at: string;
}

export interface DbUser {
  id: string;
  spotify_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
}
