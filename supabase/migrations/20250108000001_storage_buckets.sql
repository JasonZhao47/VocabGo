-- Create storage buckets for document uploads and exports

-- Document uploads bucket (24-hour retention)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'document-uploads',
  'document-uploads',
  false,
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Wordlist exports bucket (1-hour retention)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wordlist-exports',
  'wordlist-exports',
  false,
  10485760, -- 10MB limit
  ARRAY[
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for document-uploads bucket
CREATE POLICY "Users can upload their own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'document-uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'document-uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'document-uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS Policies for wordlist-exports bucket
CREATE POLICY "Users can upload their own exports"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'wordlist-exports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own exports"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'wordlist-exports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own exports"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'wordlist-exports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Service role can manage all files (for cleanup functions)
CREATE POLICY "Service role can manage all uploads"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'document-uploads' AND
    auth.jwt()->>'role' = 'service_role'
  );

CREATE POLICY "Service role can manage all exports"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'wordlist-exports' AND
    auth.jwt()->>'role' = 'service_role'
  );

-- Function to cleanup old uploaded files (24-hour TTL)
CREATE OR REPLACE FUNCTION cleanup_old_uploads()
RETURNS void AS $$
DECLARE
  old_file RECORD;
BEGIN
  -- Find files older than 24 hours
  FOR old_file IN
    SELECT name
    FROM storage.objects
    WHERE bucket_id = 'document-uploads'
    AND created_at < NOW() - INTERVAL '24 hours'
  LOOP
    -- Delete the file
    DELETE FROM storage.objects
    WHERE bucket_id = 'document-uploads'
    AND name = old_file.name;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old export files (1-hour TTL)
CREATE OR REPLACE FUNCTION cleanup_old_exports()
RETURNS void AS $$
DECLARE
  old_file RECORD;
BEGIN
  -- Find files older than 1 hour
  FOR old_file IN
    SELECT name
    FROM storage.objects
    WHERE bucket_id = 'wordlist-exports'
    AND created_at < NOW() - INTERVAL '1 hour'
  LOOP
    -- Delete the file
    DELETE FROM storage.objects
    WHERE bucket_id = 'wordlist-exports'
    AND name = old_file.name;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
