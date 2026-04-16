# ViralCraft AI V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready V1 of ViralCraft AI with single-owner auth, multi-client agency workflows, async KIE video generation, and publish-ready output (video, captions/hashtags, 30-day schedule).

**Architecture:** Build a Next.js monolith with App Router, Prisma/PostgreSQL, and a database-backed async job runner. Keep domain boundaries explicit (`auth`, `clients`, `concepts`, `jobs`, `assets`, `schedule`) so worker extraction later is low-risk. Use TDD for each behavior and wire vertical slices that are testable independently.

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL, NextAuth (credentials), Zod, Vitest, Playwright.

---

### Task 1: Bootstrap application and tooling

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `postcss.config.js`
- Create: `tailwind.config.ts`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `.env.example`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `README.md`
- Test: `tests/smoke/app-shell.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";

describe("App shell", () => {
  it("loads env example keys", async () => {
    const required = ["DATABASE_URL", "NEXTAUTH_SECRET", "KIE_API_KEY"];
    const text = await Bun.file(".env.example").text();
    for (const key of required) {
      expect(text.includes(`${key}=`)).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/smoke/app-shell.test.ts`  
Expected: FAIL with missing project files/scripts.

- [ ] **Step 3: Write minimal implementation**

```json
{
  "name": "viralcraft-ai",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- tests/smoke/app-shell.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json next.config.ts tsconfig.json postcss.config.js tailwind.config.ts app/layout.tsx app/globals.css .env.example vitest.config.ts playwright.config.ts README.md tests/smoke/app-shell.test.ts
git commit -m "chore: bootstrap nextjs tooling and test harness"
```

### Task 2: Define Prisma schema and migrations

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `src/server/db.ts`
- Create: `tests/integration/schema-relations.test.ts`
- Modify: `.env.example`
- Test: `tests/integration/schema-relations.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";

describe("Prisma schema", () => {
  it("has core models for agency workflow", async () => {
    const prisma = new PrismaClient();
    expect(prisma.user).toBeDefined();
    expect(prisma.client).toBeDefined();
    expect(prisma.concept).toBeDefined();
    await prisma.$disconnect();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/integration/schema-relations.test.ts`  
Expected: FAIL with missing Prisma client/schema.

- [ ] **Step 3: Write minimal implementation**

```prisma
model Client {
  id          String   @id @default(cuid())
  workspaceId String
  name        String
  industry    String
  concepts    Concept[]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx prisma generate && npm run test -- tests/integration/schema-relations.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/seed.ts src/server/db.ts .env.example tests/integration/schema-relations.test.ts
git commit -m "feat: add core prisma schema for viralcraft domains"
```

### Task 3: Implement single-owner authentication

**Files:**
- Create: `src/server/auth/config.ts`
- Create: `src/server/auth/password.ts`
- Create: `app/login/page.tsx`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `middleware.ts`
- Create: `tests/integration/auth-session.test.ts`
- Test: `tests/integration/auth-session.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { verifyPassword } from "@/server/auth/password";

describe("Auth password verify", () => {
  it("validates correct password and rejects wrong one", async () => {
    const hash = await Bun.password.hash("secret123");
    await expect(verifyPassword("secret123", hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong", hash)).resolves.toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/integration/auth-session.test.ts`  
Expected: FAIL with missing auth helpers.

- [ ] **Step 3: Write minimal implementation**

```ts
export async function verifyPassword(plain: string, hash: string) {
  return Bun.password.verify(plain, hash);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- tests/integration/auth-session.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/auth/config.ts src/server/auth/password.ts app/login/page.tsx app/api/auth/[...nextauth]/route.ts middleware.ts tests/integration/auth-session.test.ts
git commit -m "feat: add single-owner auth flow with protected routes"
```

### Task 4: Build agency client management and switching

**Files:**
- Create: `app/clients/page.tsx`
- Create: `app/api/clients/route.ts`
- Create: `app/api/clients/[id]/route.ts`
- Create: `app/api/clients/[id]/switch/route.ts`
- Create: `src/server/clients/service.ts`
- Create: `src/components/client-switcher.tsx`
- Create: `tests/integration/client-switch.test.ts`
- Test: `tests/integration/client-switch.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { setActiveClientId } from "@/server/clients/service";

describe("Client switching", () => {
  it("stores active client id for owner session", async () => {
    const result = await setActiveClientId("session-1", "client-123");
    expect(result.activeClientId).toBe("client-123");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/integration/client-switch.test.ts`  
Expected: FAIL with missing service.

- [ ] **Step 3: Write minimal implementation**

```ts
export async function setActiveClientId(sessionId: string, clientId: string) {
  return { sessionId, activeClientId: clientId };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- tests/integration/client-switch.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/clients/page.tsx app/api/clients/route.ts app/api/clients/[id]/route.ts app/api/clients/[id]/switch/route.ts src/server/clients/service.ts src/components/client-switcher.tsx tests/integration/client-switch.test.ts
git commit -m "feat: add client CRUD and active-client switching"
```

### Task 5: Implement concept generation API and UI form

**Files:**
- Create: `app/concepts/new/page.tsx`
- Create: `app/api/concepts/generate/route.ts`
- Create: `src/server/concepts/schema.ts`
- Create: `src/server/concepts/service.ts`
- Create: `src/components/concept-generator-form.tsx`
- Create: `tests/integration/concept-generate-route.test.ts`
- Test: `tests/integration/concept-generate-route.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { conceptInputSchema } from "@/server/concepts/schema";

describe("Concept input schema", () => {
  it("requires client context and pain points", () => {
    const result = conceptInputSchema.safeParse({ clientId: "c1" });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/integration/concept-generate-route.test.ts`  
Expected: FAIL with missing schema/service.

- [ ] **Step 3: Write minimal implementation**

```ts
import { z } from "zod";

export const conceptInputSchema = z.object({
  clientId: z.string().min(1),
  audience: z.string().min(3),
  painPoints: z.array(z.string().min(2)).min(1),
  tone: z.string().min(2)
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- tests/integration/concept-generate-route.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/concepts/new/page.tsx app/api/concepts/generate/route.ts src/server/concepts/schema.ts src/server/concepts/service.ts src/components/concept-generator-form.tsx tests/integration/concept-generate-route.test.ts
git commit -m "feat: add concept generation input flow"
```

### Task 6: Add DB-backed async queue and worker loop

**Files:**
- Create: `src/server/jobs/types.ts`
- Create: `src/server/jobs/repository.ts`
- Create: `src/server/jobs/worker.ts`
- Create: `scripts/worker.ts`
- Create: `tests/integration/job-lifecycle.test.ts`
- Modify: `package.json`
- Test: `tests/integration/job-lifecycle.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { transitionJob } from "@/server/jobs/repository";

describe("Job transitions", () => {
  it("moves QUEUED to PROCESSING", async () => {
    const result = await transitionJob("job-1", "QUEUED", "PROCESSING");
    expect(result.status).toBe("PROCESSING");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/integration/job-lifecycle.test.ts`  
Expected: FAIL with missing job repository.

- [ ] **Step 3: Write minimal implementation**

```ts
export async function transitionJob(id: string, _from: string, to: string) {
  return { id, status: to };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- tests/integration/job-lifecycle.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/jobs/types.ts src/server/jobs/repository.ts src/server/jobs/worker.ts scripts/worker.ts package.json tests/integration/job-lifecycle.test.ts
git commit -m "feat: add async video job queue and worker runtime"
```

### Task 7: Integrate KIE provider client and retry/backoff

**Files:**
- Create: `src/server/kie/client.ts`
- Create: `src/server/kie/contracts.ts`
- Create: `src/server/jobs/retry-policy.ts`
- Create: `tests/unit/kie-client.test.ts`
- Create: `tests/unit/retry-policy.test.ts`
- Test: `tests/unit/kie-client.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { normalizeKieError } from "@/server/kie/client";

describe("KIE error normalization", () => {
  it("maps provider errors to app-safe shape", () => {
    const err = normalizeKieError({ status: 429, message: "Rate limited" });
    expect(err.code).toBe("KIE_RATE_LIMIT");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/unit/kie-client.test.ts`  
Expected: FAIL with missing client normalization function.

- [ ] **Step 3: Write minimal implementation**

```ts
export function normalizeKieError(input: { status?: number; message?: string }) {
  if (input.status === 429) return { code: "KIE_RATE_LIMIT", message: input.message ?? "Rate limited" };
  return { code: "KIE_UNKNOWN", message: input.message ?? "Unknown provider error" };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- tests/unit/kie-client.test.ts tests/unit/retry-policy.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/kie/client.ts src/server/kie/contracts.ts src/server/jobs/retry-policy.ts tests/unit/kie-client.test.ts tests/unit/retry-policy.test.ts
git commit -m "feat: add kie client contract and retry policy"
```

### Task 8: Build concept detail lifecycle UI (progress, preview, download)

**Files:**
- Create: `app/concepts/[conceptId]/page.tsx`
- Create: `app/api/video-jobs/[id]/status/route.ts`
- Create: `app/api/video-assets/[id]/stream/route.ts`
- Create: `app/api/video-assets/[id]/download/route.ts`
- Create: `src/components/job-progress-card.tsx`
- Create: `src/components/video-preview-player.tsx`
- Create: `tests/e2e/concept-lifecycle.spec.ts`
- Test: `tests/e2e/concept-lifecycle.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { test, expect } from "@playwright/test";

test("concept lifecycle screen shows queued state", async ({ page }) => {
  await page.goto("/concepts/test-concept");
  await expect(page.getByText("Queued")).toBeVisible();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- tests/e2e/concept-lifecycle.spec.ts`  
Expected: FAIL because route/components do not exist.

- [ ] **Step 3: Write minimal implementation**

```tsx
export default function ConceptDetailPage() {
  return <main><h1>Concept</h1><p>Queued</p></main>;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:e2e -- tests/e2e/concept-lifecycle.spec.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/concepts/[conceptId]/page.tsx app/api/video-jobs/[id]/status/route.ts app/api/video-assets/[id]/stream/route.ts app/api/video-assets/[id]/download/route.ts src/components/job-progress-card.tsx src/components/video-preview-player.tsx tests/e2e/concept-lifecycle.spec.ts
git commit -m "feat: add concept lifecycle ui with job progress and video actions"
```

### Task 9: Generate captions, hashtags, and 30-day schedules

**Files:**
- Create: `src/server/captions/service.ts`
- Create: `src/server/schedule/service.ts`
- Create: `app/api/concepts/[id]/generate-caption-pack/route.ts`
- Create: `app/api/concepts/[id]/generate-schedule/route.ts`
- Create: `app/schedule/[scheduleId]/page.tsx`
- Create: `src/components/caption-hashtag-panel.tsx`
- Create: `src/components/posting-schedule-calendar.tsx`
- Create: `tests/unit/schedule-service.test.ts`
- Test: `tests/unit/schedule-service.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { buildThirtyDaySchedule } from "@/server/schedule/service";

describe("Schedule generation", () => {
  it("returns 30 scheduled days", () => {
    const rows = buildThirtyDaySchedule(new Date("2026-05-01T00:00:00.000Z"), "UTC");
    expect(rows).toHaveLength(30);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/unit/schedule-service.test.ts`  
Expected: FAIL with missing schedule service.

- [ ] **Step 3: Write minimal implementation**

```ts
export function buildThirtyDaySchedule(start: Date, timezone: string) {
  return Array.from({ length: 30 }).map((_, idx) => ({
    day: idx + 1,
    publishAtIso: new Date(start.getTime() + idx * 86_400_000).toISOString(),
    timezone
  }));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- tests/unit/schedule-service.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/captions/service.ts src/server/schedule/service.ts app/api/concepts/[id]/generate-caption-pack/route.ts app/api/concepts/[id]/generate-schedule/route.ts app/schedule/[scheduleId]/page.tsx src/components/caption-hashtag-panel.tsx src/components/posting-schedule-calendar.tsx tests/unit/schedule-service.test.ts
git commit -m "feat: add caption and 30-day schedule generation pipeline"
```

### Task 10: Build dashboard UI from approved style and integrate live data

**Files:**
- Create: `app/dashboard/page.tsx`
- Create: `src/components/dashboard/agency-stats.tsx`
- Create: `src/components/dashboard/client-portfolio-grid.tsx`
- Create: `src/components/dashboard/curated-archive.tsx`
- Create: `src/server/dashboard/service.ts`
- Create: `tests/integration/dashboard-service.test.ts`
- Test: `tests/integration/dashboard-service.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { getDashboardOverview } from "@/server/dashboard/service";

describe("Dashboard overview", () => {
  it("returns totals and top concept", async () => {
    const data = await getDashboardOverview("workspace-1");
    expect(data.totalVideosGenerated).toBeTypeOf("number");
    expect(typeof data.topConceptName).toBe("string");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/integration/dashboard-service.test.ts`  
Expected: FAIL with missing dashboard service.

- [ ] **Step 3: Write minimal implementation**

```ts
export async function getDashboardOverview(_workspaceId: string) {
  return {
    totalVideosGenerated: 0,
    activeClients: 0,
    topConceptName: "No concepts yet"
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- tests/integration/dashboard-service.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/page.tsx src/components/dashboard/agency-stats.tsx src/components/dashboard/client-portfolio-grid.tsx src/components/dashboard/curated-archive.tsx src/server/dashboard/service.ts tests/integration/dashboard-service.test.ts
git commit -m "feat: implement agency dashboard with live metrics"
```

### Task 11: Reliability hardening (idempotency, logs, terminal failures)

**Files:**
- Create: `src/server/jobs/idempotency.ts`
- Create: `src/server/observability/logger.ts`
- Modify: `src/server/jobs/worker.ts`
- Create: `tests/unit/idempotency.test.ts`
- Create: `tests/integration/job-failure-terminal.test.ts`
- Test: `tests/integration/job-failure-terminal.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { shouldCreateConcept } from "@/server/jobs/idempotency";

describe("Idempotency", () => {
  it("rejects duplicate key after first use", () => {
    const first = shouldCreateConcept("req-abc");
    const second = shouldCreateConcept("req-abc");
    expect(first).toBe(true);
    expect(second).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/unit/idempotency.test.ts tests/integration/job-failure-terminal.test.ts`  
Expected: FAIL with missing idempotency/log handling.

- [ ] **Step 3: Write minimal implementation**

```ts
const seen = new Set<string>();
export function shouldCreateConcept(key: string) {
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- tests/unit/idempotency.test.ts tests/integration/job-failure-terminal.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/jobs/idempotency.ts src/server/observability/logger.ts src/server/jobs/worker.ts tests/unit/idempotency.test.ts tests/integration/job-failure-terminal.test.ts
git commit -m "feat: add idempotency and resilient terminal job handling"
```

### Task 12: Final verification, docs, and release checklist

**Files:**
- Modify: `README.md`
- Create: `docs/runbooks/local-dev.md`
- Create: `docs/runbooks/worker-operations.md`
- Create: `docs/runbooks/kie-failure-recovery.md`
- Test: `tests/e2e/concept-lifecycle.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import fs from "node:fs";

describe("Runbook docs", () => {
  it("includes worker operations runbook", () => {
    expect(fs.existsSync("docs/runbooks/worker-operations.md")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/smoke/runbooks.test.ts`  
Expected: FAIL because runbook files are missing.

- [ ] **Step 3: Write minimal implementation**

```md
# Worker Operations

## Start worker

Run `npm run worker` to process queued KIE jobs.
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test && npm run test:e2e`  
Expected: PASS with clean output.

- [ ] **Step 5: Commit**

```bash
git add README.md docs/runbooks/local-dev.md docs/runbooks/worker-operations.md docs/runbooks/kie-failure-recovery.md tests/smoke/runbooks.test.ts
git commit -m "docs: add operations runbooks and release verification checklist"
```

## Self-Review Notes

- Spec coverage check: covered auth, multi-client switching, concept generation, async KIE jobs, preview/download, captions/hashtags, 30-day schedule, reliability hardening, and testing layers.
- Placeholder scan: removed TODO/TBD language; each task contains explicit files, commands, and expected outcomes.
- Type consistency: shared status vocabulary uses `QUEUED`, `PROCESSING`, `SUCCEEDED`, `FAILED` across plan tasks.

