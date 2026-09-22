# Job Board

A mobile-first job board built with React, TypeScript, and Vite. Two real pages — a job board and a job details page — plus two mock pages that demonstrate a sign-up flow and an external application flow, with no real backend or authentication.

See [SCOPING.md](./SCOPING.md) for the product analysis this build is based on.

## Quick start

### Docker (recommended)

```bash
docker compose up --build
```

The app is served at **http://localhost:8080**.

### Local development

Requires Node 20+.

```bash
npm install
npm run dev
```

## Environment variables

| Variable              | Required | Default                            | Notes                                                        |
| ---------------------- | -------- | ----------------------------------- | ------------------------------------------------------------- |
| `VITE_API_BASE_URL`    | No       | `https://develop.api.athyna.com`    | Base URL of the public jobs API. See the note below on Docker. |

Copy `.env.example` to `.env` to override locally:

```bash
cp .env.example .env
```

**Important — this is a build-time variable, not a runtime one.** Vite inlines every `VITE_*` variable into the JavaScript bundle when it builds. That means:

- In `docker-compose.yml`, `VITE_API_BASE_URL` is passed as a build **arg**, not a container environment variable — setting it with `docker run -e VITE_API_BASE_URL=...` on the built image would have no effect, because the value is already baked into the static files.
- To point at a different API, rebuild:
  ```bash
  VITE_API_BASE_URL=https://your-api.example.com docker compose up --build
  ```

The API is public and unauthenticated, so no secrets are involved — nothing beyond this URL needs to be configured.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript compiler in `--noEmit` mode |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |

## Routes

| Route | Description |
| --- | --- |
| `/jobs` | Job board — search, filters, sort, pagination |
| `/jobs/:jobId` | Job details — contextual filters, "Find similar jobs", Apply CTA |
| `/signup` | Mock sign-up flow (no account is ever created) |
| `/apply/:jobId` | Mock external application flow (no redirect ever happens) |
| `/mock-analytics` | The Mock PostHog dashboard |

## Architecture

```
src/
  api/          Axios instance + typed error mapping, jobs.ts (fetch + Zod validation)
  analytics/    Mock PostHog: types, the analytics.track() facade, the event store, session/source resolution, dashboard metrics
  schemas/      Zod schemas — job, filters (+ URL/API serialization), signup, application
  types/        TypeScript types inferred from the Zod schemas
  utils/        Pure, unit-tested helpers (salary/seniority formatting, similar-jobs logic, device/acquisition detection, date, url)
  hooks/        useJobFilters (URL-as-state), useJobs/useJob (fetch + cache), usePageTiming, useAnalytics
  components/   jobs/, filters/, forms/, layout/, ui/
  pages/        One component per route
  router/       Route table (code-split by lazy import, except the job board)
```

**State**: the URL is the single source of truth for filters (`useJobFilters`); there's no global state library. Local UI state (drawer open/closed, form drafts) is plain `useState`.

**Analytics**: everything funnels through `analytics.track(event, props)` in `src/analytics/analytics.ts`. Components never talk to the underlying mock store directly, and nothing is sent over the network — swapping in real PostHog later means changing that one file. The dashboard at `/mock-analytics` computes every number it shows from the event log generated during the current browser session.

## Working against the live API — what's real and what isn't

This app consumes `https://develop.api.athyna.com/api/public/jobs` directly from the browser (CORS is open). A few things about the live dataset are worth knowing, because they shape parts of the UI:

- **`city`, `country`, `skills`, and `category` are close to 0% populated** in the current dataset. The filter model and API layer fully support all 14 documented query parameters — that's a contract requirement — but the UI only ever renders a filter chip for a field a given job actually has, rather than a fixed set of fields.
- **`remote` is a presence flag, not a boolean** on the API: `remote=false` returns the same results as `remote=true`. The app never sends `remote=false` — the "Remote only" checkbox either sends `remote=true` or omits the parameter.
- **Any unrecognized query parameter returns HTTP 400.** The filter serializer is a strict allowlist of the 14 documented parameters for this reason — a stray `utm_source` (which the app tracks separately, in the URL and in analytics) is never forwarded to the API.
- **The detail endpoint (`/api/public/jobs/{id}`) returns a bare job object**, not the `{ data, pagination }` envelope the list endpoint uses.
- **`description` is Markdown**, rendered with `react-markdown` (no `rehype-raw`, so any HTML embedded in a description is shown as literal text rather than executed).
- Typical list requests take **3.5–4.5 seconds**. The board keeps the previous page's results visible (dimmed, with a progress bar) while a new request is in flight, rather than blanking the page on every filter change.

## Security notes

- No real authentication, no passwords or tokens are ever stored.
- All user input, API responses, and URL query parameters are validated with Zod before use.
- `dangerouslySetInnerHTML` is never used; the job description (Markdown from the API) is rendered through `react-markdown` without raw-HTML support.
- The mock "apply" flow never redirects anywhere — a job's real `applicationUrl` is shown as inert, read-only hostname text (and only when it parses as a well-formed `https:` URL), never used to construct a navigation.
- No secrets are present in the frontend; the jobs API is public and unauthenticated.

## Testing

```bash
npm test
```

Tests focus on business logic rather than coverage padding: filter parsing/serialization (including the allowlist that prevents the API's 400 on unknown params), Zod schema validation and resilient list parsing, acquisition-source detection and session persistence, device-type classification, the "similar jobs" filter-building logic, analytics event enrichment, and duplicate-suppression in the page-timing hook (including a StrictMode double-invoke regression test).
