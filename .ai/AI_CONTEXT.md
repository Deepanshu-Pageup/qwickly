# AI Context

## Project Overview
QR Generator application.

## Tech Stack
Next.js App Router, Tailwind CSS, CrossUI, Prisma, MySQL, Zod, pnpm.

## Current Phase
Phase 1 (Setup and Foundation - Security Baseline & Gated Database Operations).

## Completed Work (Verified)
- **Phase 1.1**: Initial Next.js layout, Tailwind CSS, core configuration.
- **Phase 1.2 (Database & Environment Foundation)**:
  - Prisma 7.10.0 configured with `@prisma/adapter-mariadb` driver adapter.
  - Runtime environment validation in `src/server/env.ts` (Zod) and `PrismaClient` singleton in `src/server/db.ts`.
  - CLI configuration in `prisma.config.ts` supported by `dotenv` in `devDependencies`.
  - Safe connectivity test script in `scripts/test-db-connection.ts` with bounded timeout.
  - Fully verified: `prisma validate`, `tsc --noEmit`, and `eslint` pass with 0 errors.
  - Active gate: Live database migrations pending user authorization and database credentials.
- **Phase 1.3.1 (Edge & Transport Security)**:
  - Declarative HTTP security headers in `next.config.ts` (CSP, HSTS in production, X-Content-Type-Options, X-Frame-Options, Permissions-Policy, Referrer-Policy).
  - Next.js 16 `src/proxy.ts` handler for `/api/:path*` CORS origin negotiation, preflight `OPTIONS` short-circuiting, and Rule 05 inline rationale comments.
  - Environment validation for `ALLOWED_ORIGINS` in `src/server/env.ts` and template in `.env.example`.
  - Fully verified: `tsc --noEmit`, `eslint`, and `next build` (Turbopack production build) pass with 0 errors.
- **Phase 1.4 (REST API Foundation)**:
  - Standardized API route conventions under `src/app/api/v1/` with reference health check endpoint (`/api/v1/health`).
  - Single-point `X-Request-ID` resolution and validation policy (`/^[a-zA-Z0-9_-]{16,64}$/`) with UUIDv4 fallback.
  - Consistent propagation through handler context, response headers, error envelopes, and structured server logs.
  - Standard success builders (`apiSuccess`, `apiCreated`, `apiNoContent`, `apiPaginated`) and error envelope (`VALIDATION_ERROR`, `BAD_REQUEST`, `AppError`, internal 500 masking).
  - Next.js 16 Proxy updated with `X-Request-ID` in allowed and exposed CORS headers.
  - Fully verified: 15 automated tests passed via `pnpm test`, `eslint` clean, `pnpm build` clean, and focused code audit passed.
- **Phase 1.5 (Documentation & Phase Validation)**:
  - Overhauled root `README.md` with complete project architecture, prerequisites (Node 20/24+, pnpm 12.11.2, MySQL 8+), step-by-step local setup, verified package scripts, API conventions, database workflow, and recommended CI pipeline (labeled as recommendation, not implemented).
  - Consolidated Phase 1 verification matrix across 14 criteria: all core foundation tests, lint, types, and build verified exit code 0.
  - Live database migrations recorded as GATED / PENDING credentials.
  - CrossUI rendering recorded as DEFERRED to Phase 2.
  - Fully verified: `pnpm prisma:validate` (0), `tsc --noEmit` (0), `pnpm lint` (0), `pnpm test` (0), `pnpm build` (0).

## Architectural & Governance Constraints
- Single monolithic repository.
- Strict frontend/backend separation via `src/server/`.
- Do not record completed work or architectural decisions here without verified evidence or approval.
- Architecture Decision Records (ADRs) are located in `docs/architecture/decisions/` and created on-demand ONLY upon explicit user request.
- Default Git operations are read-only (`git status`, `git diff`, `git log`). State-changing Git commands require explicit user authorization.
