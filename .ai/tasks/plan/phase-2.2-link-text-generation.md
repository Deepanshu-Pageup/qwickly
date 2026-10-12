# Task: Plan Sub-phase 2.2 — Link and Text QR Generation

## Workflow

Follow the existing governance process:

Explore → Plan → Explicit Approval → Implement → Validate → Review Diff → Report.

This is planning-only. Do not modify application code, install packages, or change configuration.

## First: Explore the Existing Implementation

Inspect the completed Sub-phase 2.1 implementation, including:

- `src/types/qr.ts`
- `src/components/studio/qr-type-selector.tsx`
- `src/components/studio/studio-placeholders.tsx`
- `src/app/page.tsx`
- `tests/studio/foundation.test.ts`
- `AGENTS.md`
- `.ai/AI_CONTEXT.md`
- `.ai/rules/frontend-ui.md`
- `package.json` and existing validation utilities

Verify the actual files and current architecture. Reuse existing components and conventions.

## Scope

Plan the following:

1. Link QR input and validation using Zod.
2. Text QR input and validation using Zod.
3. Client-side QR encoding using an appropriate, compatible library.
4. Live QR preview for valid Link and Text payloads.
5. Integration with the existing nine-type selector and studio layout.
6. Accessible loading, validation, and error states where relevant.
7. Unit tests for payload validation and QR generation behavior.
8. Browser tests if supported by the existing test infrastructure.

## Constraints

- Preserve the existing Next.js App Router architecture.
- Follow `.ai/rules/frontend-ui.md` and existing coss UI conventions.
- Reuse existing Zod and QR-related dependencies if present.
- Do not add a dependency without identifying it and obtaining approval.
- Static Link and Text QR generation must not require login, API requests, or database persistence.
- Do not implement PNG/SVG downloads, browser-local guest history, PDF/image hosting, or advanced design customization.
- Keep advanced design customization in Sub-phase 2.3.
- Do not modify unrelated files or introduce premature abstractions.

## Validation

Inspect `package.json` and identify the exact commands available for tests, type checking, linting, and production build.

## Deliverable

Return:

- Verified repository findings.
- Proposed QR encoding library and compatibility assessment.
- Zod validation strategy.
- Component and state-flow design.
- Exact proposed file changes.
- Test strategy and validation commands.
- Risks, assumptions, and acceptance criteria.

Wait for explicit approval before implementation.