# Sub-plan 1.4 — REST API Foundation

## Objective

Establish consistent, predictable, and maintainable behavior for REST API endpoints in the QR Code Generator project.

## Project Context

- Frontend: Next.js, TypeScript, Tailwind CSS, CrossUI
- Backend: Next.js Route Handlers and REST APIs
- Database: MySQL
- ORM: Prisma
- Validation: Zod
- Package manager: pnpm
- Application architecture: Single Next.js application; do not introduce separate frontend and backend frameworks.

## Mandatory Workflow

Follow the existing repository instructions, `AGENTS.md`, and `.ai/` rules and agents.

1. Explore the existing repository and understand its architecture.
2. Inspect existing API routes, middleware, error handling, request validation, environment configuration, logging, and tests.
3. Identify existing implementations that can be reused.
4. Prepare a detailed implementation plan.
5. Present the plan for approval and STOP. Do not modify any files or install dependencies before approval.
6. After approval, implement only the approved changes.
7. Run relevant tests, type checks, linting, and build verification.
8. Review the final diff and report changes, test results, and outstanding issues.

Do not skip the approval step.

## Tasks

### 1.4.1 — Establish API Route Conventions

- Use Next.js Route Handlers under `src/app/api/`.
- Adopt `/api/v1/` as the proposed API version prefix, subject to compatibility with existing routes.
- Keep API routes clearly organized and separate from page routes.
- Use appropriate HTTP methods and status codes.
- Keep route handlers thin; move reusable business logic into appropriate server-side modules as the application grows.
- Avoid introducing unnecessary architectural abstractions.

### 1.4.2 — Define the Success Response Approach

Define and document a consistent JSON success-response convention.

Requirements:
- Use appropriate HTTP status codes.
- Return predictable response bodies.
- Support successful operations, resource creation, and empty responses where appropriate.
- Avoid wrapping every response in unnecessary nested objects.
- Preserve compatibility with existing consumers if any exist.

Propose the response structure in the implementation plan before applying it.

### 1.4.3 — Define the Standard Error Envelope

Use the following as the proposed error contract:

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid data",
    "requestId": "example-request-id"
  }
}

Requirements:
- Use stable, machine-readable error codes.
- Provide safe, useful error messages.
- Map known application errors to appropriate HTTP status codes.
- Handle unexpected errors without exposing stack traces, database errors, secrets, or internal implementation details.
- Integrate with existing Zod validation and error handling where possible.
- Do not leak sensitive request data into logs.

### 1.4.4 — Implement Request ID Generation or Acceptance

- Accept an incoming request ID only when it passes a documented format and length validation policy.
- Generate a new request ID when one is missing or invalid.
- Treat all incoming request ID values as untrusted input.
- Use a consistent request ID header, preferably `X-Request-ID`.
- Ensure the implementation works with the existing Next.js Route Handler architecture and runtime constraints.
- Prevent untrusted header values from being reflected into responses or logs without validation.

### 1.4.5 — Propagate Request IDs

- Make the request ID available to downstream server-side request handling and error processing.
- Return the request ID in the `X-Request-ID` response header.
- Include the request ID in standardized error responses.
- Include it in relevant structured logs.
- Ensure generated IDs and accepted IDs follow the same validation policy.
- Avoid duplicating request ID generation across individual endpoints.

### 1.4.6 — Add Baseline API Foundation Tests

Test at least the following cases:

1. A valid incoming request ID is accepted according to policy.
2. A missing request ID results in a generated ID.
3. An invalid request ID is replaced with a generated ID.
4. The response contains the request ID header.
5. Standardized errors contain the expected error envelope.
6. Validation errors return the appropriate status and stable error code.
7. Unexpected errors do not expose internal details.
8. Request IDs remain consistent across the response header, error envelope, and relevant logs.

Use the repository's existing testing setup if suitable. If no runner is configured, inspect the installed Next.js and Node.js versions before recommending a compatible option. Do not install multiple testing frameworks.

## Implementation Constraints

- Do not modify unrelated files or security changes already implemented under Sub-plan 1.3.
- Do not introduce a monorepo, separate backend framework, or unnecessary dependencies.
- Do not redesign the entire application architecture.
- Reuse existing utilities, configuration, logging, validation, and error-handling patterns.
- Do not expose internal exceptions or sensitive information to API clients.
- Keep business logic out of route handlers where appropriate.
- Follow existing naming, formatting, and testing conventions.
- Do not assume a feature is missing until the repository has been inspected.

## Required Deliverables Before Approval

Return an implementation plan containing:

1. Repository findings and current API foundation status.
2. Existing files and utilities that can be reused.
3. Exact files proposed for creation or modification.
4. Proposed success and error response contracts, with examples.
5. Request ID validation and propagation strategy.
6. Proposed test cases and test-runner compatibility findings.
7. Dependencies to add, if any, with justification.
8. Implementation sequence and acceptance criteria.
9. Risks, compatibility concerns, and unresolved decisions.

STOP after presenting the plan and wait for explicit approval.

## Acceptance Criteria

The completed implementation must demonstrate that:

- API routes follow the agreed naming and versioning conventions.
- Success responses and error responses follow their documented contracts.
- Appropriate HTTP status codes are returned.
- Missing or invalid request IDs are handled safely.
- Request IDs propagate consistently through response headers, error envelopes, and relevant logs.
- Internal errors do not leak implementation details.
- Automated tests verify the common API behavior.
- Existing functionality and the previously completed security changes remain intact.

## Completion Report

After implementation and validation, report:

- Files created and modified.
- Behavior implemented.
- Tests added and executed.
- Formatting, lint, type-check, and build results.
- Any failed checks or unresolved issues.
- Final diff review and confirmation that unrelated changes were avoided.