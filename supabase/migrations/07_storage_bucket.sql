-- Create storage bucket for restaurant images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurants', 'restaurants', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view restaurant images
CREATE POLICY "Anyone can view restaurant images"
ON storage.objects FOR SELECT
USING (bucket_id = 'restaurants');

-- Allow authenticated users to upload restaurant images
CREATE POLICY "Authenticated users can upload restaurant images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'restaurants' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update restaurant images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'restaurants' 
  AND auth.role() = 'authenticated'
);

-- Allow admins to delete restaurant images
CREATE POLICY "Admins can delete restaurant images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'restaurants' 
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);
