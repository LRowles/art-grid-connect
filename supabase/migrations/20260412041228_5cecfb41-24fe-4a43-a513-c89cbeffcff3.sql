
-- 1. Add new profile columns to the artists table
ALTER TABLE public.artists
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS social_handle TEXT,
  ADD COLUMN IF NOT EXISTS aviation_connection BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS aviation_description TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Create artist_posts table for Follow Along content
CREATE TABLE IF NOT EXISTS public.artist_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  grid_cell TEXT NOT NULL,
  caption TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_artist_posts_artist_id ON public.artist_posts(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_posts_created_at ON public.artist_posts(created_at DESC);

-- 3. Create email_reminders table
CREATE TABLE IF NOT EXISTS public.email_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent'
);

CREATE INDEX IF NOT EXISTS idx_email_reminders_artist_id ON public.email_reminders(artist_id);
CREATE INDEX IF NOT EXISTS idx_email_reminders_type ON public.email_reminders(email_type);

-- 4. RLS for artist_posts
ALTER TABLE public.artist_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved posts"
  ON public.artist_posts FOR SELECT
  USING (approved = TRUE);

CREATE POLICY "Anon can insert posts"
  ON public.artist_posts FOR INSERT
  TO anon
  WITH CHECK (TRUE);

CREATE POLICY "Admin full access to posts"
  ON public.artist_posts FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- 5. RLS for email_reminders
ALTER TABLE public.email_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to email_reminders"
  ON public.email_reminders FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- 6. Allow anon to update artist profiles
CREATE POLICY "Anon can update artist profiles"
  ON public.artists FOR UPDATE
  TO anon
  USING (TRUE)
  WITH CHECK (TRUE);
