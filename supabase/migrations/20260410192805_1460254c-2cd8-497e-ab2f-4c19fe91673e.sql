-- Anon can view grid assignments (public grid)
CREATE POLICY "Anon can view grid_assignments"
ON public.grid_assignments
FOR SELECT
TO anon
USING (true);

-- Anon can insert artists (self-registration)
CREATE POLICY "Anon can insert artists"
ON public.artists
FOR INSERT
TO anon
WITH CHECK (true);

-- Anon can update grid_assignments only to claim unassigned cells
CREATE POLICY "Anon can claim unassigned grid cells"
ON public.grid_assignments
FOR UPDATE
TO anon
USING (artist_id IS NULL)
WITH CHECK (true);