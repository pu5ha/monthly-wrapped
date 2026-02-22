-- Users (synced from Spotify on login)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_id TEXT UNIQUE NOT NULL,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly wraps
CREATE TABLE wraps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  top_tracks JSONB NOT NULL,
  top_artists JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

-- Index for fast lookup of user wraps
CREATE INDEX idx_wraps_user_id ON wraps(user_id);

-- Create storage bucket for wrap images
-- (Run this in Supabase dashboard or via API:
--  INSERT INTO storage.buckets (id, name, public) VALUES ('wraps', 'wraps', true);
-- )
