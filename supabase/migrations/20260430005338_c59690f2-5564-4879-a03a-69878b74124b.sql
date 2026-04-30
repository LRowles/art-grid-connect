-- 1) Remove public read access to backup_artists (sensitive PII)
DROP POLICY IF EXISTS "Anon can select backup_artists" ON public.backup_artists;

-- 2) Remove blanket anon UPDATE on artists table (privilege escalation risk)
DROP POLICY IF EXISTS "Anon can update artist profiles" ON public.artists;

-- 3) Tighten the anon claim policy on grid_assignments
DROP POLICY IF EXISTS "Anon can claim unassigned grid cells" ON public.grid_assignments;

CREATE POLICY "Anon can claim unassigned grid cells"
  ON public.grid_assignments
  FOR UPDATE
  TO anon
  USING (artist_id IS NULL)
  WITH CHECK (
    artist_id IS NOT NULL
    AND status = 'registered'::grid_status
    AND assigned_at IS NOT NULL
  );