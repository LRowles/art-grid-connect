
CREATE TYPE public.grid_status AS ENUM ('available', 'assigned', 'in_progress', 'completed', 'collected');

CREATE TABLE public.artists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.grid_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grid_cell TEXT NOT NULL UNIQUE,
  artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
  status public.grid_status NOT NULL DEFAULT 'available',
  notes TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grid_cell TEXT NOT NULL,
  old_status public.grid_status,
  new_status public.grid_status NOT NULL,
  changed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grid_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view artists" ON public.artists FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert artists" ON public.artists FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update artists" ON public.artists FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete artists" ON public.artists FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view grid_assignments" ON public.grid_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert grid_assignments" ON public.grid_assignments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update grid_assignments" ON public.grid_assignments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete grid_assignments" ON public.grid_assignments FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view status_history" ON public.status_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert status_history" ON public.status_history FOR INSERT TO authenticated WITH CHECK (true);

CREATE INDEX idx_grid_assignments_grid_cell ON public.grid_assignments(grid_cell);
CREATE INDEX idx_grid_assignments_artist_id ON public.grid_assignments(artist_id);
CREATE INDEX idx_grid_assignments_status ON public.grid_assignments(status);
CREATE INDEX idx_status_history_grid_cell ON public.status_history(grid_cell);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON public.artists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_grid_assignments_updated_at BEFORE UPDATE ON public.grid_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.grid_assignments (grid_cell)
SELECT col || row_num::text
FROM (VALUES ('A'),('B'),('C'),('D'),('E'),('F'),('G'),('H'),('I'),('J'),('K'),('L'),('M'),('N'),('O'),('P'),('Q'),('R')) AS cols(col)
CROSS JOIN generate_series(1, 13) AS row_num
ORDER BY row_num, col;
