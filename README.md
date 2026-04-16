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
- `NEXTAUTH_SECRET`
- `KIE_API_KEY`
