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
<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# InsureCompare - Professional Insurance Comparison System

A professional internal system for insurance advisors to compare medical aid, hospital plans, and gap cover from multiple providers.

## Features

- 📊 **Multi-Provider Comparison** - Compare 2+ insurance providers side-by-side
- 🤖 **AI Smart Import** - Paste text from brochures and let AI parse the data
- 📄 **Professional PDF Reports** - Generate branded client-facing reports
- 👥 **Client Management** - Centralized client database
- 📋 **Audit Trail** - Track all changes for compliance
- 🔄 **Export/Import** - Backup and restore functionality
- ☁️ **Cloud Sync** - Supabase integration for data persistence

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Database**: Supabase (PostgreSQL)
- **Testing**: Vitest + React Testing Library
- **CI/CD**: GitHub Actions + Vercel
- **AI**: Google Gemini API

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account (optional, for cloud features)
- Google Gemini API key (for AI import)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/J4skii/InsureCompare.git
   cd InsureCompare
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Configure your environment variables in `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Database Setup (Supabase)

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in Supabase
3. Copy and run the contents of `supabase/schema.sql`
4. Get your project URL and anon key from Settings → API
5. Add them to your `.env.local`

## Project Structure

```
InsureCompare/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page components
│   │   ├── Dashboard.tsx
│   │   ├── ComparisonView.tsx
│   │   ├── CreateComparison.tsx
│   │   ├── Clients.tsx
│   │   └── AuditLogs.tsx
│   ├── lib/              # Utilities and API
│   │   ├── supabase.ts   # Supabase client
│   │   ├── api.ts        # API functions
│   │   └── data-layer.ts # Data abstraction layer
│   ├── test/             # Test setup
│   └── types.ts          # TypeScript types
├── supabase/
│   └── schema.sql        # Database schema
├── .github/
│   └── workflows/        # CI/CD pipelines
└── public/               # Static assets
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests with UI |
| `npm run test:run` | Run tests headless |
| `npm run test:coverage` | Run tests with coverage |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

The CI/CD pipeline automatically runs on every push and PR.

### Manual Build

```bash
npm run build
npm run preview
```

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Commit your changes: `git commit -am 'Add new feature'`
3. Push to the branch: `git push origin feature/my-feature`
4. Create a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests, please use the GitHub Issues page.

---

<div align="center">
  Built with ❤️ for Insurance Advisors
</div>
