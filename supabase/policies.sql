-- Enable Row Level Security on the form_responses table so that public clients
-- cannot read or write without going through the server action.
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;

-- The server action uses the service role, which bypasses RLS. No public table
-- policy is required; leaving RLS enabled without public policies blocks direct
-- browser access to form responses.
DROP POLICY IF EXISTS "Service role full access" ON form_responses;

-- Keep attachments private. The server action uploads with the service role,
-- which bypasses Storage RLS, so no policy is required for these writes.
UPDATE storage.buckets
SET public = false
WHERE id = 'form_files';

-- Supabase Storage policies are PostgreSQL RLS policies on storage.objects.
-- Remove legacy client-write policies if they exist. Do not write to a
-- storage.policies table; Supabase does not expose one.
DROP POLICY IF EXISTS "Public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated uploads" ON storage.objects;
