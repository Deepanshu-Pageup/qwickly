# Task: Revise Phase 1.2 Plan to v8 — Final Safety Corrections

## Objective
Revise the existing `Phase 1.2 Environment & Database Foundation (v7)` plan into v8 by addressing the remaining technical and safety issues identified during review.

**This is a planning-only task. Do not implement the plan.**

## 1. Strict Execution Constraints

- Explore the existing plan, repository instructions, and relevant configuration before proposing changes.
- Do not modify application code or configuration files.
- Do not install, remove, or upgrade dependencies.
- Do not execute database migrations, introspection, baseline resolution, or other database-changing operations.
- Git operations must remain read-only.
- Do not create an ADR unless explicitly requested.
- Preserve the existing five-file implementation scope unless repository inspection proves a change is necessary.
- Do not claim that a check passed unless you actually executed it and observed the result.
- The revised plan must remain `PROPOSED` and await explicit user approval.

## 2. Fix the Connectivity Test Timeout

The v7 connectivity test uses `setTimeout()` to set `process.exitCode = 1`. This does not guarantee that the process terminates if the database query remains pending.

Revise the test strategy so that it:

1. Runs a read-only query against the intended MySQL database.
2. Enforces a genuine overall timeout.
3. Does not incorrectly claim that a JavaScript timeout cancels an underlying database query.
4. Guarantees cleanup of the Prisma client when possible.
5. Terminates with exit code `0` on success and a non-zero exit code on failure or timeout.
6. Does not hang indefinitely when the query or connection remains pending.
7. Uses syntax and quoting compatible with the project's Windows PowerShell environment.

Prefer a dedicated temporary TypeScript test script using `tsx` if this is safer and clearer than an inline `tsx -e` command. If you propose an additional script file, explain why it is necessary and update the file inventory explicitly rather than silently expanding scope.

Clearly distinguish connection timeouts from the overall test timeout. Ensure cleanup has a bounded duration too.

## 3. Add an Independent Authorization Gate Before Every Database Write

The plan must explicitly state that approval of the overall implementation plan does not automatically authorize database-changing operations.

Before executing either of the following, stop and request explicit authorization for that specific operation:

- `pnpm prisma migrate dev --name init` for an empty database.
- `pnpm prisma migrate resolve --applied 0_init` when baselining an existing database.

Also require separate authorization before any other operation that may modify database state, including migration application or baseline resolution under a different command.

Before requesting authorization:

- Inspect the current database state using permitted read-only methods.
- Explain the intended database operation, target database, expected effects, and relevant risks.
- Confirm whether existing tables, data, or `_prisma_migrations` history exist.
- Stop if the state is ambiguous or inconsistent.
- Never run `prisma migrate reset` or `prisma db push --force-reset`.

Keep filesystem modifications and database modifications clearly distinguished. For example, `prisma db pull` modifies the local schema file even though it does not alter database tables.

## 4. Verify Prisma Version Compatibility Honestly

Retain the intended pinned Prisma CLI and Prisma Client versions only if the compatibility evidence supports them.

The plan must:

1. Specify the exact pre-installation command:
   `pnpm info prisma@6.4.0 engines`
2. Explain that package engine metadata alone does not establish every aspect of runtime compatibility.
3. Verify the relevant Prisma 6.4.0 requirements for Node.js 24.19.0, TypeScript, and MySQL 8.
4. Keep `prisma` and `@prisma/client` versions matched.
5. Record actual command output only if the check is executed during the permitted planning phase.
6. If verification cannot be performed, explicitly mark it as pending instead of claiming the version is fully verified.

Do not install dependencies to perform this check.

## 5. Preserve the Existing Architecture and Scope

Keep the existing design unless inspection identifies a concrete issue:

- Next.js App Router with TypeScript.
- MySQL with Prisma.
- Zod environment validation.
- `server-only` guards for server modules.
- Prisma Client singleton.
- Query logging disabled by default and explicitly opt-in.
- Minimal environment variables: `DATABASE_URL` and `NODE_ENV`.
- `.env.example` contains unmistakable placeholders, not real credentials.
- `.ai/AI_CONTEXT.md` is updated only after implementation, validation, and independent architect review succeed.

Retain the five-file inventory:

1. `package.json`
2. `.env.example`
3. `prisma/schema.prisma`
4. `src/server/env.ts`
5. `src/server/db.ts`

If the timeout solution requires a sixth file, justify the addition and document its exact purpose.

## 6. Rollback and Git Safety

Preserve the existing safeguards:

- Capture initial `git status` and relevant diffs before implementation.
- Never run state-changing Git commands without separate explicit authorization.
- Revert only changes introduced by this task.
- Never delete pre-existing migrations, schema files, lockfile changes, or unrelated user work.
- Do not use broad rollback commands.

## 7. Required Output

Return the complete revised plan as:

`Phase 1.2 Environment & Database Foundation (v8)`

Include:

- Status: `PROPOSED — awaiting explicit user approval`.
- Version verification and any pending checks.
- Database inspection and migration workflows.
- Independent authorization gates for database-changing operations.
- Corrected timeout and cleanup strategy.
- Exact file inventory.
- Validation stages.
- Task-specific rollback instructions.
- Remaining risks or unresolved questions.

Conclude by confirming that this revision changes the plan only. Do not implement anything, install packages, or perform database operations.

Follow the repository's `AGENTS.md` and `.ai` workflow rules.`