# ViralCraft AI - Product Design Spec

Date: 2026-04-15
Status: Draft Approved in Chat, Pending Final User Review
Owner: Agency Founder (Single Owner Mode)
Stack: Next.js + TypeScript + Tailwind + Prisma + PostgreSQL

## 1) Product Vision

ViralCraft AI is a full-stack SaaS application for marketing agencies that generates comical, scroll-stopping social media video concepts tailored to a business's niche, audience, and pain points. It then sends selected concepts to the KIE API to generate actual videos and returns complete publish-ready output:

- In-app video preview
- Downloadable video
- Caption + hashtag pack
- 30-day posting schedule
- Supporting social content for each scheduled post

The application runs in single-user mode by default but is architected for agency-mode growth with multi-client management from day one.

## 2) Scope and Goals

### In Scope (V1)

- Single owner authentication
- Agency workspace with multiple clients
- Per-client concept generation history
- Async video job processing via KIE
- Video preview and download
- Caption and hashtag generation
- 30-day posting schedule generation
- Supporting social copy per day/post
- Client switching with isolated data views

### Out of Scope (V1)

- Team member access and granular permissions
- Native social platform auto-publishing
- Advanced analytics attribution
- White-label custom domains
- Multi-workspace ownership per user

## 3) Architecture

### Recommended Approach

Monolithic Next.js application with clear domain boundaries:

- Frontend and API in one Next.js codebase
- Prisma ORM with PostgreSQL
- Database-backed async job queue (`VideoJob` table)
- Worker process polling queued jobs and coordinating KIE integration

This approach is fastest for V1 delivery while preserving a clean migration path to dedicated worker services later.

### High-Level System Components

- **Web App (Next.js App Router):**
  - Dashboard and client workspaces
  - Concept generation and lifecycle UI
  - Preview/download and scheduling screens
- **API Layer (Route Handlers):**
  - Auth, clients, concepts, jobs, assets, schedules
- **Database (PostgreSQL + Prisma):**
  - Primary store for all domain entities and job states
- **Worker Runtime:**
  - Processes queued `VideoJob` records
  - Calls and polls KIE API
  - Writes output artifacts and status updates

### Async Pipeline

1. User submits concept generation request.
2. System stores `Concept` and enqueues `VideoJob` as `QUEUED`.
3. Worker claims job (`FOR UPDATE SKIP LOCKED`) and marks `PROCESSING`.
4. Worker calls KIE API and polls provider job status.
5. On success:
   - Store `VideoAsset`
   - Generate caption + hashtags
   - Generate 30-day schedule + supporting content
   - Mark concept `READY_TO_PUBLISH`
6. UI polls job status endpoint and updates progress until ready.

## 4) Data Model

Core entities and intended responsibilities:

- **User**
  - Single owner account in V1
- **AgencyWorkspace**
  - Top-level tenant boundary (one in V1)
- **Client**
  - Brand profile and targeting context
- **Concept**
  - Generated concept artifact and lifecycle status
- **VideoJob**
  - Async KIE orchestration and retries
- **VideoAsset**
  - Generated video metadata and storage references
- **CaptionPack**
  - Captions and hashtag variants
- **PostingSchedule**
  - 30-day planning header and strategy notes
- **ScheduledPost**
  - Daily post entries with timing/platform/content angle
- **SupportContent**
  - Companion social copy per scheduled post

### Key Relationships

- `AgencyWorkspace` 1:N `Client`
- `Client` 1:N `Concept`
- `Concept` 1:N `VideoJob`
- `Concept` 1:1 `VideoAsset` (V1)
- `Concept` 1:N `CaptionPack`
- `Concept` 1:N `PostingSchedule`
- `PostingSchedule` 1:N `ScheduledPost`
- `ScheduledPost` 1:N `SupportContent`

## 5) API Design (V1)

### Auth

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/me`

### Clients

- `GET /api/clients`
- `POST /api/clients`
- `PATCH /api/clients/:id`
- `POST /api/clients/:id/switch`

### Concepts and Jobs

- `POST /api/concepts/generate`
  - Input includes `clientId`, audience/pain points/tone/goals
  - Returns concept + queued job metadata
- `GET /api/concepts?clientId=...`
- `GET /api/concepts/:id`
- `POST /api/concepts/:id/regenerate-video`
- `GET /api/video-jobs/:id/status`

### Video Assets

- `GET /api/video-assets/:id/stream`
- `GET /api/video-assets/:id/download`

### Captions and Scheduling

- `POST /api/concepts/:id/generate-caption-pack`
- `POST /api/concepts/:id/generate-schedule`
- `GET /api/schedules/:id`

## 6) UI and Route Map

- `/login` - Owner login page
- `/dashboard` - Agency overview and active-client status
- `/clients` - Client list/create/edit/switch
- `/clients/[clientId]` - Client workspace and concept history
- `/concepts/new` - Concept generation form
- `/concepts/[conceptId]` - Full generation lifecycle view
- `/schedule/[scheduleId]` - 30-day plan detail
- `/settings` - KIE config and generation defaults

### Primary UI Components

- `ClientSwitcher`
- `ConceptGeneratorForm`
- `JobProgressCard`
- `VideoPreviewPlayer`
- `CaptionHashtagPanel`
- `PostingScheduleCalendar`
- `ScheduledPostDetailDrawer`
- `ClientHistoryTable`

## 7) Reliability and Operational Rules

- Idempotency keys for concept generation requests
- Exponential backoff retries on failed provider calls
- Dead-letter terminal status after max retries
- Structured logs with:
  - `job_id`, `client_id`, `concept_id`, `provider_request_id`
- Provider timeout and cancellation handling
- Strict validation on input payloads per client context

## 8) Testing Strategy

### Unit Tests

- Concept prompt construction logic
- Scheduling generation rules and timezone alignment
- Retry/backoff and idempotency utility behavior

### Integration Tests

- API route handler behavior with test database
- Job lifecycle state transitions
- Client isolation and switching correctness

### E2E Tests

- Login -> switch client -> generate concept -> observe progress -> preview/download -> review schedule

### Contract Tests

- KIE client mapping and error normalization using provider mocks

## 9) Delivery Plan

### Phase 1 - Foundation

- App bootstrap and auth
- Prisma schema and migrations
- Client CRUD + switch context
- Dashboard shell from provided design language

### Phase 2 - Core Engine

- Concept generation API flow
- Queue + worker + KIE async integration
- Job status UI and error/retry UX

### Phase 3 - Content Intelligence

- Caption and hashtag generation
- 30-day schedule generation
- Supporting social content creation
- Calendar/detail UX

### Phase 4 - Hardening

- Reliability and observability
- Rate limiting and validation hardening
- Test coverage and CI quality gates

## 10) Future Expansion Path (Post-V1)

- Team member roles and permissions
- Multi-workspace ownership
- Native social publishing integrations
- Performance analytics and attribution dashboards
- Versioned video outputs per concept

## 11) Acceptance Criteria (V1)

1. Owner can log in and create/manage multiple clients.
2. Owner can switch active client and see isolated history.
3. Owner can generate a comedic concept for selected client context.
4. Concept generation enqueues async KIE video job (non-blocking UI).
5. UI shows clear progress and final success/failure state.
6. On success, UI shows previewable and downloadable video output.
7. System generates and displays caption + hashtags.
8. System generates and displays a complete 30-day schedule.
9. Each scheduled day includes supporting social content.
10. Failed jobs retry with backoff and reach terminal status safely.

## 12) Implementation Notes

- Start with deterministic seeds/fixtures to make UI and test development predictable.
- Keep domain services (concept creation, job orchestration, scheduling) isolated from route handlers for maintainability.
- Preserve strict tenant filtering by `workspaceId` and `clientId` on every query, even in single-owner mode, to keep migration to team mode low-risk.

