
-- Create storage bucket for artist uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('artist-uploads', 'artist-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can view artist uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'artist-uploads');

CREATE POLICY "Anon can upload artist files"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'artist-uploads');

CREATE POLICY "Authenticated full access to artist uploads"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'artist-uploads')
  WITH CHECK (bucket_id = 'artist-uploads');
