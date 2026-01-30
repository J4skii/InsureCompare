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
