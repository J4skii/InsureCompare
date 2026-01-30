<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your InsureCompare admin app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1EUwnQ68OGszaTkNroniyjiyuTu9YWyTO

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the required environment variables in `.env.local` (see `.env.example`).
3. Run the app:
    `npm run dev`

## Deployment Notes

Supabase tables, policies, and edge functions are defined under `sql/` and `supabase/functions/`. Configure these in your Supabase project alongside the environment variables in `.env.example`.

## Go-Live Checklist (Remaining)

**Supabase Project**
1. Create a Supabase project and copy the project URL + anon key.
2. Run `sql/schema.sql` in the Supabase SQL editor to create tables, RLS, and audit triggers.
3. Create the first `super_admin` entry:
   ```sql
   insert into public.admins (id, email, role)
   values ('<auth_user_id>', '<email>', 'super_admin');
   ```
4. Configure Auth settings (Site URL + redirect URLs for Vercel).
5. Deploy Edge Functions (`parse-comparison`, `invite-admin`, `remove-admin`) and set their secrets:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`

**Vercel**
1. Create a Vercel project linked to this repo.
2. Set environment variables from `.env.example` in Vercel.
3. Build command: `npm run build`, output directory: `dist`.
4. Deploy and smoke-test login, comparison CRUD, audit log, and AI parsing.
