# Rule 01: Architecture Boundaries

- src/app/: Next.js Routing.
- src/components/: Reusable UI components.
- src/features/: Domain-specific components.
- src/server/: Backend-only services and DB access. Never imported in client components.
- src/lib/: Shared generic utilities.
- src/schemas/: Environment-independent Zod validation.

Prevent duplication across src/lib/, src/server/, and src/features/.
