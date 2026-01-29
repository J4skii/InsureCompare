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
