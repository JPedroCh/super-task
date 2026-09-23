# Athyna [Super Task]

A mobile-first job board built with React, TypeScript, and Vite. Two real pages — a job board and a job details page — plus two mock pages that demonstrate a sign-up flow and an external application flow, with no real backend or authentication.

See [SCOPING.md](./SCOPING.md) for the product analysis this build is based on, and [ARCHITECTURE.md](./ARCHITECTURE.md) for a deeper look at the codebase, the live API's quirks, security posture, and what the test suite covers.

## Setup instructions

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

### Environment variables

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | No | `https://develop.api.athyna.com` | Base URL of the public jobs API. Baked in at **build time**, not runtime — see [ARCHITECTURE.md](./ARCHITECTURE.md#environment-variables--the-build-time-detail) before trying to override it on a built image. |

Copy `.env.example` to `.env` to override locally:

```bash
cp .env.example .env
```

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript compiler in `--noEmit` mode |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |

## Approach and trade-offs

**Where the effort went.** SCOPING.md points at the job details page as the highest-leverage surface: six of seven metrics are measured on it, mobile converts at a third of desktop's rate, and the median visitor bounces in 11 seconds. It was rebuilt mobile-first — title, company, salary, and the Apply CTA all sit above the fold on a 375px viewport. The job board got the same treatment: search, Filters, sort, and the result count reflow onto separate rows on narrow screens, since mobile is 61% of traffic and lands there first.

**Closing the "Google never sees the filters" gap.** The details page now surfaces contextual filter chips and a "Find similar jobs" action built from the fields the specific job actually has — never a fixed field list, since `city`, `country`, `skills`, and `category` are close to 0% populated across the live dataset. That's a one-click path from a cold Google landing into a relevant filtered board.

**A skills filter to solve the search.** Search (`q`) is title-substring only: three of the five most popular queries — "remote", "part time", "React" — return zero results, since none of those words need to appear in a title. The Skills filter searches the `skills` field directly instead. Athyna's own "Senior Full-Stack Engineer" posting proves the gap: React is in its skills but not its title, so search can't find it — only the Skills filter can.

**Analytics is genuinely mock.** Events go through an `analytics.track()` facade into an in-memory + `sessionStorage`-backed store, visible on `/mock-analytics` — no real PostHog integration. Numbers reset per browser tab and never aggregate across users; it demonstrates the event model, not a real analytics pipeline.

**Deliberately left alone.** The signup wall isn't touched or gated further — 74% of users who meet it never return. 

## Demonstration video

## What I'd improve with more time

Explore a solution for dynamically populating the `skills` array when it is incomplete or incorrectly populated, potentially by identifying relevant keywords in the job description and mapping them to the available skills.
