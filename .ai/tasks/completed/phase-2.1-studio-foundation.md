# Task: Explore and Plan Sub-phase 2.1 — QR Studio Foundation

## Objective
Prepare an implementation plan for Sub-phase 2.1 of Phase 2 — QR Generation and Design Studio.

**This is a planning-only task. Do not implement anything.**

## 1. Mandatory Workflow

Follow the project workflow:

1. Explore the existing codebase.
2. Identify relevant architecture, conventions, dependencies, and constraints.
3. Prepare a detailed implementation plan.
4. Stop and wait for explicit approval.

Do not modify application code, configuration, dependencies, lockfiles, database schema, or existing documentation during this task.

## 2. Project Context

The project uses:

- Next.js App Router and TypeScript.
- Tailwind CSS v4.
- CrossUI, whose rendering was deferred to Phase 2.
- Next.js Route Handlers for REST APIs.
- MySQL with Prisma ORM.
- Zod for validation.
- The existing `/api/v1` API convention.
- A single Next.js application and repository.

Preserve the existing architecture and follow the project's `AGENTS.md`, `.ai/AI_CONTEXT.md`, rules, and applicable agent instructions.

## 3. Explore

Inspect the actual repository and report:

- Current App Router structure and existing pages.
- Existing shared components, layout, styles, and design conventions.
- CrossUI installation, configuration, usage, and compatibility with the existing Tailwind setup.
- Existing dependencies that could support the QR Studio UI without adding packages.
- Existing TypeScript types, Zod schemas, utilities, and API conventions relevant to the feature.
- Existing testing tools and available validation scripts.
- Applicable accessibility and responsive design conventions.
- Any architectural conflicts, missing prerequisites, or implementation risks.

Do not assume that files, components, dependencies, or configurations exist. Verify them.

## 4. Approved Scope

Plan only the following work:

1. Create the QR Studio homepage.
2. Create a type selector for all nine QR types:
   - Link
   - Text
   - PDF
   - Image
   - WhatsApp
   - Social Media
   - Map Address
   - Coupon
   - App Link
3. Define or reuse shared TypeScript types for QR types and studio navigation.
4. Establish reusable UI boundaries for:
   - QR type selection.
   - Generator form area.
   - Preview area.
   - Customization and export action placeholders.
5. Integrate CrossUI consistently with the existing styling system.
6. Make the page responsive and accessible.
7. Add appropriate tests for the implemented foundation.

The generator forms, QR encoding, live preview, design customization, file hosting, downloads, persistence, and guest history belong to subsequent sub-phases. Do not implement them now.

Placeholders must not falsely imply that functionality is operational.

## 5. Architecture Constraints

- Follow the existing architecture rather than introducing a new one.
- Use the existing App Router and repository conventions.
- Do not introduce a separate frontend or backend application.
- Do not add dependencies unless a verified requirement cannot be satisfied by existing dependencies. Document any proposed dependency separately for approval.
- Do not implement backend endpoints or database models for this UI foundation.
- Do not perform unrelated refactoring.
- Do not weaken existing security, validation, accessibility, or error-handling conventions.
- Avoid unnecessary abstractions and premature directory creation.

## 6. Required Implementation Plan

Produce a plan containing:

1. Current-state findings with verified file paths.
2. Proposed user experience and page structure.
3. Proposed component boundaries and responsibilities.
4. Nine-type selector behavior and navigation/state approach.
5. Responsive layout and accessibility requirements.
6. CrossUI integration strategy based on actual repository findings.
7. Exact files to create or modify, with the purpose of each change.
8. Testing strategy using existing project tools.
9. Validation commands taken from the actual package scripts.
10. Risks, dependencies, assumptions, and explicit out-of-scope items.
11. Sub-phase acceptance criteria.

For each proposed file change, explain why it is necessary and whether an existing file can be reused.

## 7. Acceptance Criteria

The plan must ensure that:

- All nine QR types are discoverable.
- Selecting a type produces a clear selected state and corresponding studio context.
- The page works on mobile, tablet, and desktop.
- Keyboard navigation, focus visibility, accessible names, and semantic structure are considered.
- The form, preview, customization, and export areas are ready for later integration without implementing those features prematurely.
- Existing Phase 1 behavior and checks remain unaffected.

## 8. Final Report

Return:

- Repository findings.
- Proposed UI structure.
- Exact file change list.
- Implementation sequence.
- Tests and validation commands.
- Risks and unresolved questions.
- Acceptance checklist.

Clearly state that no files were modified and wait for approval before implementation.