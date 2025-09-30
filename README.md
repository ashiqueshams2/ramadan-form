# Ramadan Form

This project provides a secure Ramadan planning form backed by Supabase using Next.js App Router and server actions.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template and provide your Supabase credentials (service role key is required on the server only):

   ```bash
   cp .env.example .env.local
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

The form submits through a Next.js server action that stores data in Supabase and uploads any attachments to Supabase Storage without exposing credentials to the browser.

## Security

* Supabase keys are loaded exclusively from environment variables on the server (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).
* Server actions handle all database and file operations, keeping the client credential-free.
* Uploaded files are stored via the Supabase Storage helpers and their public URLs are returned to the client as part of the response.
* See `supabase/policies.sql` for recommended Row Level Security policies to ensure only authenticated traffic can interact with the `form_responses` table and `form_files` bucket.
