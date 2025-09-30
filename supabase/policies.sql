-- Enable Row Level Security on the form_responses table so that public clients
-- cannot read or write without going through authenticated paths.
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;

-- Restrict all read/write operations to the service role only. This ensures
-- inserts happen exclusively through trusted server-side code (e.g. Next.js
-- server actions using the service role key).
DROP POLICY IF EXISTS "Service role full access" ON form_responses;
CREATE POLICY "Service role full access"
ON form_responses
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Optionally, if you want authenticated users to read their own submissions,
-- add an additional policy similar to the commented example below and ensure
-- the table contains a user_id column populated with auth.uid().
-- CREATE POLICY "Authenticated users read own submissions"
-- ON form_responses
-- FOR SELECT
-- USING (auth.uid() = user_id);

-- Protect the `form_files` storage bucket by disabling public access and
-- allowing uploads/downloads only for authenticated contexts.
UPDATE storage.buckets
SET public = false
WHERE id = 'form_files';

-- Replace existing storage policies with stricter rules.
DELETE FROM storage.policies WHERE bucket_id = 'form_files';

-- Allow uploads via authenticated server-side contexts (service role key).
INSERT INTO storage.policies (bucket_id, name, definition, action)
VALUES (
  'form_files',
  'Service role uploads',
  'auth.role() = ''service_role''',
  'upload'
);

-- Allow reads via authenticated requests. Add more granular checks if desired.
INSERT INTO storage.policies (bucket_id, name, definition, action)
VALUES (
  'form_files',
  'Service role reads',
  'auth.role() = ''service_role''',
  'read'
);
