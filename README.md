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
* Uploaded files are kept in a private Supabase Storage bucket. The database stores durable object paths; trusted server-side readers should create short-lived signed URLs when files need to be downloaded.
* See `supabase/policies.sql` for recommended Row Level Security setup. The server action uses the service role for inserts and uploads, while direct public writes remain blocked.
