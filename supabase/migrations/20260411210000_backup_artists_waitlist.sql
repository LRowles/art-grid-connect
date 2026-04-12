-- ============================================================
-- Backup Artist Waitlist System
-- ============================================================
-- Supports unlimited backup artist signups.
-- First 16 are "priority" backups; the rest are general waitlist.
-- Admin can promote a backup artist to a grid square when a
-- primary artist doesn't return their canvas.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.backup_artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  bio TEXT,
  website TEXT,
  social_handle TEXT,
  aviation_connection BOOLEAN DEFAULT FALSE,
  aviation_description TEXT,
  waitlist_position INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',  -- 'waiting', 'offered', 'assigned', 'declined'
  assigned_grid_cell TEXT,                 -- filled when promoted to a square
  promoted_at TIMESTAMPTZ,                -- when they were assigned a square
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_assigned_grid_cell FOREIGN KEY (assigned_grid_cell) REFERENCES public.grid_assignments(grid_cell)
);

-- Auto-update updated_at
CREATE TRIGGER set_backup_artists_updated_at
  BEFORE UPDATE ON public.backup_artists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Index for ordering by position
CREATE INDEX idx_backup_artists_position ON public.backup_artists(waitlist_position);
CREATE INDEX idx_backup_artists_status ON public.backup_artists(status);

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE public.backup_artists ENABLE ROW LEVEL SECURITY;

-- Public can read backup artists (for waitlist count display)
CREATE POLICY "Public can view backup artists"
  ON public.backup_artists FOR SELECT
  USING (true);

-- Anonymous users can insert (self-registration)
CREATE POLICY "Anon can register as backup artist"
  ON public.backup_artists FOR INSERT
  WITH CHECK (true);

-- Authenticated admins can do everything
CREATE POLICY "Admins can manage backup artists"
  ON public.backup_artists FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================================
-- Helper function: Get next waitlist position
-- ============================================================
CREATE OR REPLACE FUNCTION public.next_waitlist_position()
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(MAX(waitlist_position), 0) + 1 FROM public.backup_artists;
$$;
