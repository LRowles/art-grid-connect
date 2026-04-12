
-- Create backup_artists table
CREATE TABLE public.backup_artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  bio text,
  website text,
  social_handle text,
  aviation_connection boolean DEFAULT false,
  aviation_description text,
  waitlist_position integer NOT NULL,
  status text NOT NULL DEFAULT 'waiting',
  assigned_grid_cell text,
  promoted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.backup_artists ENABLE ROW LEVEL SECURITY;

-- Anon can insert (public registration)
CREATE POLICY "Anon can insert backup_artists" ON public.backup_artists
  FOR INSERT TO anon WITH CHECK (true);

-- Anon can view count
CREATE POLICY "Anon can select backup_artists" ON public.backup_artists
  FOR SELECT TO anon USING (true);

-- Authenticated full access
CREATE POLICY "Authenticated full access backup_artists" ON public.backup_artists
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create next_waitlist_position function
CREATE OR REPLACE FUNCTION public.next_waitlist_position()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(MAX(waitlist_position), 0) + 1 FROM public.backup_artists;
$$;
