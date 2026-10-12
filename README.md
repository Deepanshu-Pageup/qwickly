# Qwikly — QR Code Generator

A modern, high-performance QR code generator web application built on the Next.js App Router, Tailwind CSS, Prisma ORM, and MySQL.

---

## 1. Project Overview & Architecture

Qwikly is designed as a single, cohesive Next.js full-stack application following strict architectural separation of concerns:

- **Frontend (`src/app/`)**: Next.js 16 App Router pages, layout, and client/server React components.
- **Backend Services (`src/server/`)**: Backend-only business logic, database queries, and environment validation. Guaranteed never to leak into client bundles via `import 'server-only'`.
- **API Endpoints (`src/app/api/v1/`)**: REST Route Handlers versioned under `/api/v1/`, featuring standardized success responses, centralized error handling, and request tracing.
- **Edge Security & CORS (`src/proxy.ts`)**: Next.js 16 Proxy intercepting `/api/:path*` requests to manage cross-origin negotiation, credentials, and preflight requests without deprecated middleware overhead.
- **Database Layer (`prisma/`)**: Prisma 7 ORM using `@prisma/adapter-mariadb` driver adapter connected to MySQL.

---

## 2. Prerequisites & Tooling Requirements

Before setting up the project locally, verify your machine meets the following runtime requirements:

- **Node.js**: `v20.x` or `v24.x` (verified with Node.js `v24.16.0`).
- **pnpm**: `v12.11.2` (enforced via `packageManager` in `package.json`).
- **MySQL / MariaDB**: MySQL 8.0+ or compatible MariaDB server running locally or accessible via network.

---

## 3. Getting Started & Local Setup

### 3.1 Clone & Install Dependencies
Install all project dependencies using the committed frozen lockfile:
```bash
corepack enable
pnpm install --frozen-lockfile
```

### 3.2 Configure Environment Variables
Copy the template configuration into a local `.env` file:
```bash
cp .env.example .env
```
Open `.env` and configure your local MySQL credentials:
```env
# Required: MySQL database connection string
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/qwikly_db"

# Optional: Runtime environment ('development' | 'test' | 'production', default: 'development')
NODE_ENV="development"

# Optional: Enable Prisma query logging ('true' | 'false', default: 'false')
DB_LOG_QUERIES="false"

# Optional: Comma-separated list of allowed CORS origins (default: http://localhost:3000,http://127.0.0.1:3000)
ALLOWED_ORIGINS="http://localhost:3000"
```

### 3.3 Validate Database Schema & Client
Verify that the Prisma schema is structurally sound and generate the Prisma Client:
```bash
pnpm prisma:validate
pnpm prisma:generate
```

### 3.4 Start the Development Server
Launch the Next.js local development server with Turbopack:
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Verified Available Scripts

The following scripts are defined in `package.json` and verified against the repository:

| Command | Purpose |
| :--- | :--- |
| `pnpm dev` | Starts the Next.js development server with Turbopack. |
| `pnpm build` | Compiles the production build using Next.js Turbopack. |
| `pnpm start` | Runs the compiled Next.js production server. |
| `pnpm lint` | Runs ESLint across the codebase. |
| `pnpm test` | Runs the automated API foundation test suite with Node.js native test runner. |
| `pnpm exec tsc --noEmit` | Runs the TypeScript compiler to verify static types without emitting files. |
| `pnpm prisma:validate` | Validates `prisma/schema.prisma` syntax and configuration. |
| `pnpm prisma:generate` | Generates the Prisma Client with the MariaDB driver adapter. |
| `pnpm prisma:migrate` | Runs development migrations (`prisma migrate dev`). *(Gated on live DB)* |
| `pnpm exec prisma migrate deploy` | Applies pending migrations in production or CI environments. *(Gated on live DB)* |
| `pnpm prisma:studio` | Opens Prisma Studio GUI to inspect database records in the browser. |
| `pnpm db:test` | Executes a safe database connectivity test with a bounded 10-second timeout ceiling. |

---

## 5. API Conventions & Request Tracing

All REST endpoints follow consistent conventions established in Phase 1.4:

### 5.1 Route Hierarchy
- Versioned under `/api/v1/` (e.g., `GET /api/v1/health`).
- Business logic is kept thin in route handlers and isolated in server modules.

### 5.2 Request ID Lifecycle (`X-Request-ID`)
- **Resolution**: Resolved **strictly once per request** at the API entry boundary (`createApiHandler`).
- **Policy**: Incoming `X-Request-ID` headers are validated against `/^[a-zA-Z0-9_-]{16,64}$/`. If missing, blank, or invalid, a fresh RFC 4122 UUIDv4 is generated via `crypto.randomUUID()`.
- **Propagation**: Echoed in response headers (`X-Request-ID`), structured server error logs (`[RequestId: ...]`), and error response envelopes.
- **CORS Support**: `X-Request-ID` is explicitly allowed and exposed to browser clients in `src/proxy.ts`.

### 5.3 Standard Success Responses
Payloads are returned directly with appropriate HTTP status codes:
- **`200 OK`**: Single resource, health check, or collection.
- **`201 Created`**: Newly created entity.
- **`204 No Content`**: Successful action with an empty body (e.g., deletion).
- **Paginated Collection**: Structured envelope containing `items: T[]` and `pagination` metadata.

### 5.4 Standard Error Envelope
All API errors return a predictable JSON contract:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid data",
    "requestId": "7b83f58e-fdb7-4c3d-bc65-7fb557cb2d2c",
    "details": [
      { "field": "url", "message": "Must be a valid URL" }
    ]
  }
}
```
- **Error Codes**: `VALIDATION_ERROR` (400), `BAD_REQUEST` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `INTERNAL_SERVER_ERROR` (500).
- **Secret Masking**: Internal exceptions, raw database errors, and stack traces are masked behind generic error messages to prevent information disclosure.

---

## 6. Database & Migration Workflow

- **ORM Configuration**: Defined in `prisma.config.ts` and `prisma/schema.prisma`.
- **Driver Adapter**: Uses `@prisma/adapter-mariadb` for native TypeScript MySQL connection handling.
- **Safe Development Flow**:
  1. Update model definitions in `prisma/schema.prisma`.
  2. Run `pnpm prisma:validate` to ensure syntax correctness.
  3. Run `pnpm prisma:migrate` to create and apply migration files locally.
- **Deployment Flow**:
  1. Run `pnpm exec prisma migrate deploy` in staging or production to apply migration files without prompting.
- **Safety Gate**:
  > [!IMPORTANT]
  > Never run destructive commands (`prisma migrate reset` or `prisma db push --force-reset`) against shared or production databases. Database migrations on live infrastructure are intentionally gated until valid credentials and explicit authorization are provided.

---

## 7. Recommended CI Pipeline (Documented Recommendation — Not Implemented)

*Note: A GitHub Actions workflow is not currently committed to the repository. The following workflow recipe is recommended when setting up CI:*

```yaml
name: CI Quality Checks
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 12.11.2
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm prisma:validate
      - run: pnpm exec tsc --noEmit
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
        env:
          DATABASE_URL: "mysql://user:pass@127.0.0.1:3306/qwikly_test"
          NODE_ENV: "production"
```
