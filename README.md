# ViralCraftAI v1 Bootstrap

Task 1 bootstraps a minimal Next.js project shell with TypeScript, Tailwind CSS,
Vitest, and Playwright configuration.

## Scripts

- `npm run dev` - Start Next.js dev server
- `npm run build` - Build app
- `npm run start` - Start production server
- `npm test` - Run Vitest tests
- `npm run test:smoke` - Run the smoke test for required environment keys
- `npm run test:e2e` - Run Playwright tests

## Environment

Copy `.env.example` to `.env.local` and populate:

- `DATABASE_URL`
- `AUTH_SECRET` or `NEXTAUTH_SECRET` (random string, e.g. `openssl rand -base64 32`)
- `NEXTAUTH_URL` (e.g. `http://localhost:3000` in development)
- `KIE_API_KEY`

Apply migrations, then seed the demo owner (development):

```bash
npx prisma migrate deploy
npm run db:seed
```

Demo sign-in (unless you set `DEMO_OWNER_PASSWORD`):

- Email: `owner@example.com`
- Password: `demo-password-change-me`

In production, `db:seed` is skipped unless `ALLOW_DEMO_SEED=true`.

## Clients (agency mode)

- Open `/clients` to create and list brand workspaces (stored per agency workspace).
- Use the header **client switcher** to set the active client; the choice is stored in an
  httpOnly cookie (`vc_active_client`) for server-side use in later features.
- API: `GET/POST /api/clients`, `PATCH /api/clients/[id]`, `POST /api/clients/[id]/switch`.
