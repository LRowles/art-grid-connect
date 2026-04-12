-- Migration: Add artist profile fields, artist_posts table, and email_reminders table
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ============================================================
-- 1. Add new profile columns to the artists table
-- ============================================================
ALTER TABLE public.artists
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS social_handle TEXT,
  ADD COLUMN IF NOT EXISTS aviation_connection BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS aviation_description TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- ============================================================
-- 2. Create artist_posts table for Follow Along content
-- ============================================================
CREATE TABLE IF NOT EXISTS public.artist_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  grid_cell TEXT NOT NULL,
  caption TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image', -- 'image' or 'video'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved BOOLEAN DEFAULT TRUE
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_artist_posts_artist_id ON public.artist_posts(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_posts_created_at ON public.artist_posts(created_at DESC);

-- ============================================================
-- 3. Create email_reminders table for tracking sent emails
-- ============================================================
CREATE TABLE IF NOT EXISTS public.email_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL, -- 'deadline_reminder', 'thank_you', 'invitation'
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent' -- 'sent', 'failed', 'pending'
);

CREATE INDEX IF NOT EXISTS idx_email_reminders_artist_id ON public.email_reminders(artist_id);
CREATE INDEX IF NOT EXISTS idx_email_reminders_type ON public.email_reminders(email_type);

-- ============================================================
-- 4. RLS Policies for artist_posts (public read, anon insert)
-- ============================================================
ALTER TABLE public.artist_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved posts
CREATE POLICY "Public can view approved posts"
  ON public.artist_posts FOR SELECT
  USING (approved = TRUE);

-- Anonymous users can insert posts (artists submitting their content)
CREATE POLICY "Anon can insert posts"
  ON public.artist_posts FOR INSERT
  TO anon
  WITH CHECK (TRUE);

-- Authenticated users (admin) can do everything
CREATE POLICY "Admin full access to posts"
  ON public.artist_posts FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- ============================================================
-- 5. RLS Policies for email_reminders (admin only)
-- ============================================================
ALTER TABLE public.email_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to email_reminders"
  ON public.email_reminders FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- ============================================================
-- 6. Update existing anon policy on artists to allow updating profile fields
-- ============================================================
-- Allow anon users to update their own profile fields (bio, website, etc.)
-- This uses a permissive approach; in production you may want row-level tokens
CREATE POLICY "Anon can update artist profiles"
  ON public.artists FOR UPDATE
  TO anon
  USING (TRUE)
  WITH CHECK (TRUE);

-- ============================================================
-- 7. Supabase Storage bucket for artist uploads (run separately if needed)
-- ============================================================
-- NOTE: You may need to create a storage bucket called 'artist-uploads' 
-- in your Supabase Dashboard → Storage → New Bucket
-- Set it to PUBLIC so images can be displayed on the site
-- Allowed MIME types: image/jpeg, image/png, image/webp, video/mp4, video/webm
