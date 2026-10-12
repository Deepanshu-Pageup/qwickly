# Phase 1.3: Architecture and Security Standards

**Document Purpose**: Define non-negotiable architectural principles, security baselines, and engineering expectations for the Qwikly platform (~1,000 active users).  
**Status**: `APPROVED`  
**Scope**: Project-wide standards and guidance for future implementation. Does not prescribe premature packages, speculative infrastructure, or alternate tech stacks.  
**Approved Stack**: Next.js (App Router), Tailwind CSS, Prisma (MariaDB/MySQL driver adapter), Zod, pnpm.

---

## 1. Architectural Principles

### 1.1 Modular Monolith
- **Single Deployment Unit**: All application and backend logic resides within the Next.js application without premature distributed services.
- **Strict Boundary Separation**:
  - `src/server/` encapsulates all database operations, secrets handling, and backend services.
  - Backend modules are guarded with `server-only` to guarantee zero server logic or credentials leak into client bundles.
  - Domain concerns must remain cohesive and decoupled, avoiding circular imports or cross-domain leaks.
- **Stateless Execution**: Route handlers and server services must remain strictly stateless to allow horizontal scaling across serverless or container instances without architectural rewrites.

### 1.2 Data Integrity & Type Safety
- **Single Source of Truth**: Data models and relational constraints are governed by Prisma schemas ([`prisma/schema.prisma`](file:///C:/page-up/qwikly/prisma/schema.prisma)).
- **Safe Database Access**: All future database queries must use parameterized Prisma Client calls or parameterized template tags (`$queryRaw` tagged templates). Raw string concatenation or unescaped string interpolation into SQL queries is strictly prohibited.
- **Bounded Resource Usage**: Long-running operations, integration scripts, and database queries must enforce explicit timeouts. Specifically, the database connection verification script ([`scripts/test-db-connection.ts`](file:///C:/page-up/qwikly/scripts/test-db-connection.ts)) enforces a verified 10-second ceiling; future queries and background tasks must define appropriate operational bounds based on workload.

---

## 2. Security Standards & Controls

### 2.1 Authentication & Session Management
- **Cryptographic & Protocol Integrity**: Use established, industry-standard authentication patterns and vetted libraries. Custom cryptographic algorithms or homegrown authentication protocols are strictly prohibited.
- **Credential Storage**: Passwords must be hashed using modern, adaptive salted hashing algorithms (such as Argon2id or bcrypt with appropriate cost factor) with unique per-user salts.
- **Session & Credential Protection**:
  - Session tokens or credentials exchanged with web clients must be protected in transit and at rest.
  - When browser cookies are used, they must be configured with `httpOnly`, `Secure`, and appropriate `SameSite` flags (`Lax` or `Strict`) to mitigate credential exposure to client-side scripts and reduce cross-site leakage.
  - Sensitive tokens must not be stored in client-accessible browser storage (`localStorage` / `sessionStorage`).
- **Session Lifecycle**: Sessions or tokens must have bounded lifetimes and support revocation upon logout or credential reset. Specific token lifetimes, rotation strategies, and session storage architecture will be evaluated and decided during dedicated authentication design.

### 2.2 Input Validation & Injection Defense
- **Zero-Trust Input**: All external data (request bodies, query parameters, URL path variables, external webhooks) must be treated as untrusted.
- **Strict Schema Parsing**: Every route handler must validate and parse incoming input against explicit Zod schemas before triggering any business logic.
- **Cross-Site Scripting (XSS) Prevention**: User-supplied input must be properly validated and sanitized before persistence, and safely encoded upon rendering.

### 2.3 Network, Transport & Edge Security
- **Transport Security**: HTTPS is required across all public and production deployments. Local development environments may utilize HTTP or local TLS.
- **Security Headers**: Production responses must include standard security headers:
  - `Strict-Transport-Security` (HSTS)
  - `Content-Security-Policy` (CSP)
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - Frame protection (`X-Frame-Options: DENY` or CSP `frame-ancestors 'none'`)
- **CORS Restrictions**: Origin whitelisting must be configured to restrict cross-origin browser access to API endpoints. Wildcard (`*`) origins on credentialed routes are prohibited.
  > [!NOTE]
  > CORS governs cross-origin browser resource access and is not an authentication mechanism or a substitute for CSRF defense. Endpoints processing state-changing actions must independently enforce authentication, authorization, and appropriate CSRF protections.
- **Abuse Prevention & Rate Limiting**: Sensitive endpoints (authentication, password resets, compute-heavy generation) must enforce rate limiting with standard retry headers (`429 Too Many Requests`).

### 2.4 Secrets & Configuration Management
- **Strict Separation of Config and Code**: No secret keys, credentials, or connection strings may be committed to version control.
- **Startup Validation**: All required configuration must be validated at boot via runtime schema validation ([`src/server/env.ts`](file:///C:/page-up/qwikly/src/server/env.ts)). The application must fail fast and crash on startup if required variables are missing or malformed.
- **Sanitized Templates**: The repository must maintain [`.env.example`](file:///C:/page-up/qwikly/.env.example) containing descriptive placeholders and documentation for all environment variables without real secrets.

### 2.5 Observability, Logging & Error Sanitization
- **Sanitized Error Responses**: Internal exception details, database error codes, and server stack traces must never be exposed to clients. Client responses must use uniform, generic error payloads with appropriate HTTP status codes.
- **Structured Logging**: Application logs must use structured output (e.g., JSON) capturing event metadata, timestamps, and error classifications.
- **Sensitive Field Redaction**: Passwords, tokens, secret keys, and personally identifiable information (PII) must be masked prior to logging.

---

## 3. Engineering Expectations & Code Standards

- **Inline Rationale Comments**: In accordance with [Rule 05](file:///C:/page-up/qwikly/.ai/rules/05-code-documentation.md), logical functions containing business rules, security decisions, or complex transformations must document the "why" and underlying intent with clear inline comments.
- **Documentation Preservation**: Existing comments, docstrings, and architectural guards must not be stripped during maintenance or refactoring.
- **Testability**: Security controls, validation logic, and authentication checks must be isolated to facilitate automated unit and integration testing.

---

## 4. Current Implementation Status vs. Future Standards

| Control Area | Classification | Evidence & Current Implementation State |
|---|---|---|
| **Server Boundary Isolation** | ✅ **Implemented & Verified** | `src/server/` guarded with `server-only` import ([`src/server/db.ts`](file:///C:/page-up/qwikly/src/server/db.ts#L1), [`src/server/env.ts`](file:///C:/page-up/qwikly/src/server/env.ts#L1)); client bundle leakage prevented. Type check passes (`tsc --noEmit`). |
| **Startup Environment Validation** | ✅ **Implemented & Verified** | [`src/server/env.ts`](file:///C:/page-up/qwikly/src/server/env.ts) validates `DATABASE_URL`, `NODE_ENV`, and `DB_LOG_QUERIES` via Zod on boot; non-secret template documented in [`.env.example`](file:///C:/page-up/qwikly/.env.example). |
| **Database Client Initialization** | ✅ **Implemented & Verified** | Prisma 7.10.0 schema validated (`prisma validate`), client generated (`prisma generate`), and singleton configured with `@prisma/adapter-mariadb` in [`src/server/db.ts`](file:///C:/page-up/qwikly/src/server/db.ts). |
| **Database Test Script Timeout** | ✅ **Implemented & Verified** | [`scripts/test-db-connection.ts`](file:///C:/page-up/qwikly/scripts/test-db-connection.ts) enforces an unref'd 10,000ms overall timer and bounded 3,000ms cleanup disconnect. Verified with exit code 0. |
| **Inline Rationale Comments** | 📋 **Documented Governance Policy** | Documented standard in [`.ai/rules/05-code-documentation.md`](file:///C:/page-up/qwikly/.ai/rules/05-code-documentation.md). Enforced via code review; automated linter enforcement not yet configured. |
| **Security Headers & CORS** | ✅ **Implemented & Verified** | Baseline headers (CSP, HSTS in prod, X-Content-Type-Options, X-Frame-Options) configured in [`next.config.ts`](file:///C:/page-up/qwikly/next.config.ts); Next.js 16 [`src/proxy.ts`](file:///C:/page-up/qwikly/src/proxy.ts) CORS origin handler and preflight negotiation verified via `next build` (exit 0). |
| **Route Rate Limiting** | ⏳ *Future Standard* | Target standard for sensitive route handlers. |
| **Authentication & Session Management** | ⏳ *Future Standard* | Target standard to be implemented according to approved authentication design. |
| **Uniform Error Payload Filter** | ⏳ *Future Standard* | Target standard to be implemented in shared API error handling utilities. |
