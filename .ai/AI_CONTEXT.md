# AI Context

## Project Overview
QR Generator application.

## Tech Stack
Next.js App Router, Tailwind CSS, CrossUI, Prisma, MySQL, Zod, pnpm.

## Current Phase
Phase 1 (Setup and Foundation - Ready for Database Migration Gate).

## Completed Work (Verified)
- **Phase 1.1**: Initial Next.js layout, Tailwind CSS, core configuration.
- **Phase 1.2 (Database & Environment Foundation)**:
  - Prisma 7.10.0 configured with `@prisma/adapter-mariadb` driver adapter.
  - Runtime environment validation in `src/server/env.ts` (Zod) and `PrismaClient` singleton in `src/server/db.ts`.
  - CLI configuration in `prisma.config.ts` supported by `dotenv` in `devDependencies`.
  - Safe connectivity test script in `scripts/test-db-connection.ts` with bounded timeout.
  - Fully verified: `prisma validate`, `tsc --noEmit`, and `eslint` pass with 0 errors.
  - Active gate: Live database migrations pending user authorization and database credentials.

## Architectural & Governance Constraints
- Single monolithic repository.
- Strict frontend/backend separation via `src/server/`.
- Do not record completed work or architectural decisions here without verified evidence or approval.
- Architecture Decision Records (ADRs) are located in `docs/architecture/decisions/` and created on-demand ONLY upon explicit user request.
- Default Git operations are read-only (`git status`, `git diff`, `git log`). State-changing Git commands require explicit user authorization.
