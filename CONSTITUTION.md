# Apolaki Solar Platform — Project Constitution

**Version**: 1.0
**Status**: Ratified
**Effective Date**: February 26, 2026
**Authority**: This is the supreme governing document of the Apolaki project. All other documents, guidelines, and code must conform to it.

---

## Preamble

The Apolaki Solar Platform exists to empower individuals and organizations to manage renewable energy effectively. This Constitution establishes the immutable principles, architectural laws, and quality standards that govern every line of code, every design decision, and every operational procedure in the project.

**No feature, deadline, or convenience justifies violating this Constitution.**

---

## Article I — Architectural Law

### Section 1: Three-Tier Architecture

The system is organized into exactly three tiers. This structure is **permanent and inviolable**.

```text
┌────────────────────────────────────────────────────────────┐
│  TIER 1: PRESENTATION                                      │
│  Location: frontend/                                       │
│  Technology: Vue.js 3, Vite, Pinia, Tailwind CSS           │
│  Boundary: Communicates ONLY with Tier 2 via HTTP/WS APIs  │
├────────────────────────────────────────────────────────────┤
│  TIER 2: APPLICATION & BUSINESS LOGIC                      │
│  Location: middleware/                                      │
│  Technology: Go 1.21+ (solar-service), Node.js (db-service)│
│  Boundary: Receives requests from Tier 1, accesses Tier 3  │
├────────────────────────────────────────────────────────────┤
│  TIER 3: DATA & INFRASTRUCTURE                             │
│  Location: config/, external services                      │
│  Technology: PostgreSQL, Redis, S3, Message Queues         │
│  Boundary: Accessed ONLY by Tier 2 services                │
└────────────────────────────────────────────────────────────┘
```

**Constitutional Prohibitions:**

1. **Tier 1 shall never access Tier 3 directly.** No database connection strings, no direct SQL queries, no cache access from the frontend. Period.
2. **Tier 3 shall never initiate communication with Tier 1.** Push communication from backend to frontend must flow through Tier 2 (WebSocket, SSE).
3. **Tier 2 shall never render HTML or manipulate DOM.** Tier 2 returns data (JSON, protobuf); Tier 1 decides how to display it.
4. **Each tier is independently deployable.** A change to Tier 1 must not require a simultaneous change to Tier 2 or Tier 3. API contracts are the interface.

### Section 2: Service Boundaries

Each service owns exactly one bounded context:

| Service | Bounded Context | Authoritative Over |
| ------- | --------------- | ------------------ |
| `frontend` | User interface and client-side state | All rendering, navigation, client validation |
| `netlify-db-service` | Data persistence and user authentication | User accounts, sessions, OAuth, DB schema |
| `solar-service` | Solar domain business logic | Monitoring, marketplace, contracts, finance |
| `analytics-service` (Phase 1) | Predictive analytics and ML | Anomaly detection, forecasting, recommendations |
| `utility-service` (Phase 1) | Utility company integrations | Rate data, net metering, incentives |
| `provider-service` (Phase 1) | Provider/installer management | Provider profiles, catalogs, certifications |
| `wind-service` (Phase 2) | Wind energy domain | Turbine monitoring, wind forecasting |
| `hydro-service` (Phase 2) | Hydro energy domain | Reservoir monitoring, water management |
| `grid-service` (Phase 2) | Smart grid integration | Grid balancing, demand response |
| `trading-service` (Phase 2) | Energy trading | P2P energy marketplace, settlement |

**Constitutional Rule**: A service may not implement logic belonging to another service's bounded context. If two services need to collaborate, they communicate via well-defined APIs or events — never by sharing databases, in-memory state, or internal libraries.

### Section 3: Data Ownership

Each database table has exactly one owner service:

| Owner Service | Tables |
| ------------- | ------ |
| `netlify-db-service` | `users`, `sessions`, `oauth_tokens`, `audit_logs` |
| `solar-service` | `installations`, `monitoring_data`, `marketplace_products`, `contracts`, `assessments`, `transactions` |
| `analytics-service` | `predictions`, `anomalies`, `recommendations`, `benchmarks` |
| `provider-service` | `providers`, `provider_products`, `certifications`, `reviews` |

**Constitutional Rule**: Only the owner service may write to its tables. Other services may read via read replicas, materialized views, or published events. Cross-service writes require an API call to the owning service.

---

## Article II — SOLID Principles

### Section 1: Single Responsibility Principle

> *"A module should have one, and only one, reason to change."*

**Application:**

- **Components**: Each Vue component serves exactly one UI purpose. A `DashboardChart.vue` renders a chart. A `MarketplaceFilter.vue` manages filter state. They do not overlap.
- **Handlers**: Each Go HTTP handler maps to one route and delegates to one service method. It does not contain business logic.
- **Services**: Each Go service struct encapsulates logic for one domain aggregate. `MonitoringService` handles monitoring. `MarketplaceService` handles the marketplace.
- **Repositories**: Each repository handles data access for one domain aggregate. `InstallationRepository` accesses installation data.
- **Stores**: Each Pinia store manages state for one domain slice. `userStore` manages user/auth state. `installationStore` manages installation state.

**Enforcement**: Any file exceeding 300 lines of code must be reviewed for SRP violations and decomposed if necessary.

### Section 2: Open/Closed Principle

> *"Software entities should be open for extension, but closed for modification."*

**Application:**

- **New energy domains** (wind, hydro) are added as new services with their own codebase — the `solar-service` is never modified to accommodate them.
- **New authentication providers** are added by implementing the existing auth interface — the auth middleware is never modified per-provider.
- **New UI themes** are applied via Tailwind configuration and CSS custom properties — component source code is never modified for styling.
- **New API versions** are added as new route groups (`/api/v2/`) — existing versioned endpoints are never altered in breaking ways.

**Enforcement**: PRs that modify stable, tested code to add new functionality must justify why extension was not possible.

### Section 3: Liskov Substitution Principle

> *"Subtypes must be substitutable for their base types."*

**Application:**

- All Go interface implementations must satisfy the full contract without silent no-ops, panics, or behavioral surprises.
- All Vue components sharing a prop interface (e.g., all components accepting an `installation` prop) must behave consistently given the same prop values.
- All API endpoint versions must be backward-compatible within the same major version.

**Enforcement**: Interface compliance is verified by automated tests. Every interface implementation must have a test that exercises all methods.

### Section 4: Interface Segregation Principle

> *"Clients should not be forced to depend on interfaces they do not use."*

**Application:**

- Go interfaces should be small (1–3 methods is ideal, 5 maximum).
- If a consumer only needs `Read` access, it should depend on a `Reader` interface, not a full `Repository` interface.
- Vue component props should be minimal — pass only what the component needs, not entire objects when only one field is used.
- API responses should include only the fields the client needs — use field selection or dedicated DTOs.

**Enforcement**: Any Go interface with more than 5 methods must be decomposed. Any component accepting more than 8 props must be reviewed.

### Section 5: Dependency Inversion Principle

> *"Depend on abstractions, not concretions."*

**Application:**

- **Go services** accept interfaces, not concrete structs. `MonitoringService` depends on `InstallationRepository` (interface), not `*PostgresInstallationRepository` (struct).
- **Go handlers** accept service interfaces, not concrete service structs.
- **Vue components** consume Pinia stores and composables, never call `fetch()` or `axios` directly.
- **Configuration** is injected via environment variables or config structs, never hardcoded.

**Enforcement**: No concrete type from a lower layer may be imported by a higher layer. The dependency graph must point inward (handlers → services → repositories), with interfaces defined at each boundary.

```text
Dependency Flow (allowed):
  handlers → service interfaces → repository interfaces
               ↑                        ↑
        service implementations   repository implementations

Dependency Flow (forbidden):
  handlers → concrete services → concrete repositories
  repositories → services (circular)
  services → handlers (circular)
```

---

## Article III — MECE Decomposition

### Section 1: Mutually Exclusive Boundaries

The system is decomposed such that every responsibility has exactly one owner:

```text
┌─────────────────────────────────────────────────────────────────┐
│                    SYSTEM DECOMPOSITION                         │
├───────────────┬─────────────────────────────────────────────────┤
│ Responsibility│ Exclusive Owner                                 │
├───────────────┼─────────────────────────────────────────────────┤
│ UI Rendering  │ frontend/ (Vue components)                      │
│ Routing (FE)  │ frontend/src/router/                            │
│ Client State  │ frontend/src/stores/ (Pinia)                    │
│ API Calls     │ frontend/src/services/api.js                    │
│ Auth Logic    │ middleware/netlify-db-service/src/auth/          │
│ DB Schema     │ config/init-db.sql + migrations                 │
│ Solar Logic   │ middleware/solar-service/internal/services/      │
│ HTTP Handlers │ middleware/solar-service/internal/handlers/      │
│ Data Access   │ middleware/solar-service/internal/repositories/  │
│ Deployment    │ helm/, config/docker-compose.yml, scripts/       │
│ CI/CD         │ .github/workflows/                               │
│ Documentation │ docs/                                            │
└───────────────┴─────────────────────────────────────────────────┘
```

**Constitutional Rule**: If two modules share responsibility for the same concern, it is a constitutional violation. One must be refactored or removed.

### Section 2: Collectively Exhaustive Coverage

Every system concern must be addressed by at least one module:

| Concern | Required Coverage |
| ------- | ----------------- |
| **Authentication** | Login, registration, password reset, OAuth, MFA, session management |
| **Authorization** | RBAC for every endpoint, deny by default, role validation middleware |
| **Input Validation** | Every endpoint validates all inputs at the boundary (type, range, format, length) |
| **Error Handling** | Every code path returns a meaningful error or success; no unhandled exceptions |
| **Logging** | Every service logs structured entries for auth events, errors, data mutations, performance |
| **Monitoring** | Every service exposes health checks, metrics (latency, error rate, throughput) |
| **Testing** | Every public function has ≥1 unit test; every endpoint has ≥1 integration test |
| **Documentation** | Every API endpoint in OpenAPI spec; every component documented; every service has README |
| **Security** | OWASP Top 10 addressed for every endpoint (see Article IV) |
| **Accessibility** | WCAG 2.1 AA compliance for all frontend views |
| **Performance** | Every list endpoint is paginated; every heavy operation is async; every query is indexed |

**Constitutional Rule**: Before any release, a MECE audit must confirm that no concern is uncovered and no concern is duplicated.

---

## Article IV — OWASP Security Standards

### Section 1: Security is a First-Class Citizen

Security is not a feature to be added later. It is a **constitutional requirement** that applies from the first line of code.

**The Ten Commandments of Apolaki Security** (derived from OWASP Top 10):

1. **Thou shalt deny access by default.** Every route is protected. Public access is the exception, explicitly whitelisted.
2. **Thou shalt encrypt all data in transit.** TLS 1.2+ on all connections. No exceptions. No HTTP fallback.
3. **Thou shalt never concatenate user input into queries.** Parameterized queries or ORM methods only.
4. **Thou shalt hash all passwords with bcrypt (cost ≥ 12) or Argon2id.** Never store reversible passwords.
5. **Thou shalt never expose internal errors to clients.** Generic messages with correlation IDs externally. Full details in server logs only.
6. **Thou shalt validate all input at the boundary.** Type checking, range validation, format validation, length limits on every field.
7. **Thou shalt keep dependencies updated and scanned.** Automated vulnerability scanning in CI. Critical vulnerabilities block deployment.
8. **Thou shalt log security events.** Authentication, authorization failures, privilege changes, data access — all logged with structured metadata.
9. **Thou shalt never store secrets in code or version control.** Environment variables, vault services, or encrypted config only.
10. **Thou shalt apply the principle of least privilege everywhere.** Database users, API keys, IAM roles, RBAC permissions — minimum necessary access only.

### Section 2: Security Review Requirements

| Change Type | Security Review Required |
| ----------- | ----------------------- |
| New API endpoint | Yes — input validation, auth, authz, rate limiting |
| Authentication change | Yes — mandatory security team review |
| Database schema change | Yes — encryption audit, access control review |
| New dependency | Yes — license check, vulnerability scan, maintainer review |
| Infrastructure change | Yes — network security, secrets management |
| Frontend form | Yes — XSS prevention, CSRF protection |

### Section 3: Incident Response

1. **Detection**: Automated alerts on anomalous patterns (auth failures, data exfiltration patterns, unusual API usage)
2. **Containment**: Ability to revoke tokens, block IPs, disable features via feature flags within 15 minutes
3. **Investigation**: Structured audit logs with correlation IDs enable full request tracing
4. **Recovery**: Automated rollback capability. Database point-in-time recovery. Backup restoration tested quarterly
5. **Post-mortem**: Every security incident produces a written post-mortem with root cause analysis and corrective actions

---

## Article V — Deployment & Configuration Architecture (★ NEW)

### Section 1: Separate Deployables Principle

The system is organized into **independently deployable units** that can evolve and scale separately:

```text
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND DEPLOYABLE (frontend/)                            │
│  ├─ Can be deployed without touching backend                │
│  ├─ Uses API contract to communicate with backend           │
│  ├─ Configuration: API endpoint (environment variable)      │
│  └─ Technologies: Vue.js 3, Vite, Pinia, Tailwind CSS       │
├─────────────────────────────────────────────────────────────┤
│  BACKEND DEPLOYABLE (middleware/)                           │
│  ├─ Can be deployed without touching frontend               │
│  ├─ Serves API to frontend                                  │
│  ├─ Configuration: Database, cache, secrets (ConfigManager) │
│  └─ Technologies: Go (solar-service), Node.js (db-service) │
├─────────────────────────────────────────────────────────────┤
│  DATA LAYER (External Services)                             │
│  ├─ PostgreSQL, Redis, S3, Message Queues                   │
│  ├─ Configuration: Connection strings (injected at runtime) │
│  └─ Accessed ONLY by backend deployable                     │
└─────────────────────────────────────────────────────────────┘
```

**Constitutional Rule**: Each deployable has:
1. Its own source tree (`frontend/`, `middleware/`)
2. Its own build process (`npm run build:frontend`, Docker build)
3. Its own deployment mechanism (Netlify Static, Functions, K8s)
4. Its own version/release cycle (can be released independently)
5. Its own secrets and configuration (injected at deploy time, not shared in code)

### Section 2: Configuration Management — Zero Hardcoding Policy

All configuration (database, cache, secrets) **must be injected at application startup**, never hardcoded in code.

#### The ConfigManager Pattern

Every service that accesses external systems (database, cache, message queue) **must use ConfigManager**:

```javascript
// ALLOWED ✅
class DatabaseService {
  constructor(config) {
    this.host = config.database.host;  // Injected
    this.pool = config.database.pool;
  }
}

const config = await ConfigManager.load();
const db = new DatabaseService(config);
```

```javascript
// FORBIDDEN ❌
class DatabaseService {
  constructor() {
    this.host = process.env.DATABASE_HOST || 'localhost';  // Hardcoded fallback
    this.host = 'localhost';                               // Hardcoded default
    this.host = 'db.apolaki.com';                          // Hardcoded for production
  }
}
```

#### Configuration Priority (in order)

1. **Environment Variables** (Netlify platform variables, Docker env, etc.) — HIGHEST PRIORITY
2. **Vault Service** (HashiCorp Vault, AWS Secrets Manager) — for sensitive secrets
3. **Configuration File** (`.env.local`, config.yaml) — development only, Git-excluded
4. **Hard defaults** — ONLY for non-sensitive, non-required settings (e.g., timeout values)
5. **NO fallback to hardcoded values for required settings** — fail loudly if missing

#### What Can Be Hardcoded

| Setting | Can Hardcode | Why |
| ------- | ------------ | --- |
| API port | ✅ Yes | Default port, can be overridden by env var |
| API timeout (seconds) | ✅ Yes | Default timeout, rarely changes |
| Max pagination limit | ✅ Yes | Business rule, rarely changes |
| Database host | ❌ NO | Changes per environment |
| Database password | ❌ NO | Secret, must not be in code |
| JWT signing key | ❌ NO | Secret, must not be in code |
| Cache TTL | ✅ Yes | Default TTL, can be configured |
| Feature flags | ❌ NO | Changes at runtime without deploy |

#### Startup Validation

```javascript
async function startApplication() {
  try {
    const config = await ConfigManager.load();
    
    // ConfigManager.validate() throws if required settings are missing
    // If we reach here, config is guaranteed valid
    
    const app = new Application(config);
    await app.start();
  } catch (error) {
    console.error('Fatal configuration error:', error.message);
    console.error('Please set environment variables:');
    console.error('  DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD');
    console.error('  REDIS_HOST, JWT_SECRET');
    process.exit(1);  // Fail fast, don't run with invalid config
  }
}
```

### Section 3: Environment Isolation

Different environments use the **same code and container** with different configuration:

```text
┌──────────────────────────────────────────────────┐
│  SINGLE BACKEND DOCKER IMAGE                     │
│  (Compiled once, deployed everywhere)            │
├──────────────────────────────────────────────────┤
│  Environment Variables Injected at Startup:      │
├──────────────────────────────────────────────────┤
│  DEVELOPMENT:                                    │
│    DATABASE_HOST=localhost                       │
│    REDIS_HOST=localhost                          │
│    NODE_ENV=development                          │
├──────────────────────────────────────────────────┤
│  STAGING:                                        │
│    DATABASE_HOST=staging-db.apolaki.internal     │
│    REDIS_HOST=staging-redis.apolaki.internal     │
│    NODE_ENV=staging                              │
├──────────────────────────────────────────────────┤
│  PRODUCTION:                                     │
│    DATABASE_HOST=prod-db.apolaki.internal        │
│    REDIS_HOST=prod-redis.apolaki.internal        │
│    NODE_ENV=production                           │
└──────────────────────────────────────────────────┘
```

**Constitutional Rule**: Same image, different config = reliable deployment with zero risk of env-specific bugs.

### Section 4: Netlify Combined Deployment

When deploying to Netlify, a **single `netlify.toml` file orchestrates both frontend and backend**:

```toml
[build]
  command = "npm run build:all"      # Builds frontend + backend
  publish = "frontend/dist"          # Frontend assets

[[functions]]
  directory = "middleware/netlify-db-service/functions"
  node_bundler = "esbuild"

# NO SECRETS IN THIS FILE — all secrets in Netlify dashboard → Build & Deploy → Environment
```

**Netlify Dashboard (Build & Deploy → Environment)** contains:

```
DATABASE_HOST=apolaki-db.example.com
DATABASE_PORT=5432
DATABASE_USER=app_user
DATABASE_PASSWORD=[secure password from vault]
REDIS_HOST=apolaki-redis.example.com
JWT_SECRET=[secure signing key from vault]
```

Netlify injects these as environment variables at build and function execution time.

### Section 5: No Secrets in Version Control

| Item | Allowed in Git? | Where to Store |
| ---- | --------------- | --------------- |
| `.env` with actual secrets | ❌ NEVER | Netlify dashboard, Vault, CI secrets |
| `.env.example` template | ✅ YES | Shows required variables without values |
| API keys, passwords, tokens | ❌ NEVER | Vault, encrypted env, platform vars |
| Encryption keys | ❌ NEVER | Vault, HSM, Key Management Service |
| Database passwords | ❌ NEVER | Vault, platform environment variables |
| JWT signing keys | ❌ NEVER | Vault, platform environment variables |
| Connection strings (with password) | ❌ NEVER | Vault, platform environment variables |
| Log in CI/CD output | ❌ NEVER | Masked by default in GitHub Actions |

**Constitutional Rule**: Any commit containing secrets is immediately revoked and rewritten. CI/CD automatically scans for secrets (using `gitguardian`, `truffleHog`, etc.) and blocks commits.

### Section 6: Database Migrations

Database schema changes are **versioned and reversible**:

```
config/migrations/
├── 001_initial_schema.sql
├── 002_add_installations_table.sql
├── 003_add_monitoring_data_table.sql
├── 004_add_contracts_table.sql
└── 005_add_indexes.sql
```

**Rules**:
- Every migration is idempotent (safe to run multiple times)
- Every migration has a reverse (for rollback)
- Migrations are applied at container startup if needed
- Schema version is tracked in database
- Database connection is from ConfigManager, not hardcoded

---

## Article V — Quality Standards

### Section 1: Code Quality Gates

No code may be merged to `main` without passing:

| Gate | Requirement |
| ---- | ----------- |
| **Lint** | Zero errors from ESLint (frontend), `go vet` (Go), markdownlint (docs) |
| **Type Safety** | No `any` types in TypeScript. All Go functions have explicit return types |
| **Unit Tests** | All new/modified public functions have tests. Coverage ≥ 80% on changed files |
| **Integration Tests** | All new API endpoints have request/response tests |
| **Security Scan** | `npm audit` and `govulncheck` report zero critical/high vulnerabilities |
| **Build** | Clean build with zero warnings in production mode |
| **PR Review** | ≥ 1 human approval. Security-sensitive changes require ≥ 2 approvals |

### Section 2: Performance Standards

| Metric | Standard | Measurement |
| ------ | -------- | ----------- |
| API Response Time (p95) | < 200ms | Measured at the API gateway |
| Page Load Time | < 3 seconds | Lighthouse performance score ≥ 90 |
| Database Query Time (p95) | < 100ms | Measured via query logging |
| WebSocket Latency | < 500ms | From data generation to UI update |
| Bundle Size (frontend) | < 500KB gzipped | Measured by Vite build |
| Time to Interactive | < 2.5 seconds | Lighthouse TTI |
| Memory Usage (service) | < 512MB per pod | Kubernetes resource monitoring |

### Section 3: Testing Pyramid

```text
                    ┌─────────┐
                    │   E2E   │  ← Fewest: critical user journeys only
                    │  Tests  │     (Cypress/Playwright)
                   ─┼─────────┼─
                  │ Integration │  ← Moderate: API endpoints, DB queries,
                  │   Tests    │     service interactions
                 ─┼────────────┼─
               │    Unit Tests    │  ← Most numerous: every function,
               │   (Go, Vue, JS) │     every branch, every edge case
              ─┼──────────────────┼─
            │    Static Analysis     │  ← Always on: linting, type checking,
            │  (ESLint, go vet, TS)  │     security scanning
           ─┴────────────────────────┴─
```

**Required test scenarios for every feature:**

1. **Happy path** — Expected input produces expected output
2. **Validation failure** — Invalid input produces clear error
3. **Authorization failure** — Unauthorized access is denied
4. **Not found** — Missing resource returns 404
5. **Conflict** — Duplicate or conflicting operation returns 409
6. **Server error** — Service gracefully handles downstream failures

---

## Article VI — API Contract Law

### Section 1: REST API Standards

| Aspect | Standard |
| ------ | -------- |
| **Base URL** | `/api/v{version}/{resource}` |
| **Methods** | `GET` (read), `POST` (create), `PUT` (full update), `PATCH` (partial update), `DELETE` (remove) |
| **Status Codes** | `200` OK, `201` Created, `204` No Content, `400` Bad Request, `401` Unauthorized, `403` Forbidden, `404` Not Found, `409` Conflict, `422` Validation Error, `429` Rate Limited, `500` Internal Error |
| **Response Format** | `{ "data": {...}, "meta": { "page": 1, "limit": 20, "total": 100 } }` for lists; `{ "data": {...} }` for singles; `{ "error": { "code": "...", "message": "...", "correlationId": "..." } }` for errors |
| **Pagination** | Offset-based: `?page=1&limit=20`. Default limit: 20. Maximum limit: 100 |
| **Filtering** | Query parameters: `?status=active&type=residential` |
| **Sorting** | `?sort=created_at&order=desc` |
| **Versioning** | URL path versioning (`/api/v1/`, `/api/v2/`). No breaking changes within a version |

### Section 2: Backward Compatibility

- **No breaking changes** to existing API versions. Ever.
- **Additive changes only** within a version (new optional fields, new endpoints).
- **Deprecation process**: Mark deprecated in docs → warn in response headers for 2 release cycles → remove in next major version.
- **Contract testing**: Automated tests verify that existing clients still work after every change.

---

## Article VII — Governance

### Section 1: Amendment Process

This Constitution may be amended only through:

1. A written proposal describing the change and its rationale
2. Review by the technical lead and at least one other senior engineer
3. A 7-day comment period for the team
4. Approval by majority of active contributors
5. Updated version number and changelog entry

### Section 2: Precedence

In case of conflict between documents:

```text
1. CONSTITUTION.md          ← Supreme authority
2. AGENTS.md                ← Agent-specific implementation of the Constitution
3. docs/ARCHITECTURE.md     ← System design decisions
4. docs/API_REFERENCE.md    ← API contracts
5. CONTRIBUTING.md          ← Process guidelines
6. Individual file docs     ← File-level documentation
```

### Section 3: Violation Handling

| Severity | Example | Response |
| -------- | ------- | -------- |
| **Critical** | Tier boundary violation, SQL injection, hardcoded secrets | Block merge. Immediate fix required. Incident report. |
| **Major** | SOLID violation, missing auth on endpoint, missing tests | Block merge. Fix before approval. |
| **Minor** | Naming convention deviation, missing doc comment | Approve with comments. Fix in follow-up. |
| **Style** | Markdown lint warning, import ordering | Approve. Fix opportunistically. |

---

## Article VIII — Evolution and Phasing

### Section 1: Phase Discipline

| Phase | Scope | Timeline |
| ----- | ----- | -------- |
| **MVP** | Core monitoring, marketplace, finance, contracts, auth | Q2 2026 |
| **Phase 1** | Teams, advanced analytics, utility integration, provider portal, PWA | Q3–Q4 2026 |
| **Phase 2** | Multi-domain (wind, hydro), energy trading, mobile apps, internationalization | Q1–Q2 2027 |

**Constitutional Rule**: Code for a future phase may not be implemented during a current phase unless it is infrastructure that enables the current phase's goals. No scope creep.

### Section 2: Technical Debt Management

- Technical debt is tracked as first-class backlog items with severity labels.
- Every sprint allocates ≥ 15% of capacity to debt reduction.
- Debt items older than 3 sprints are escalated to the technical lead.
- No new feature may be started if critical technical debt exists in the same module.

---

## Signatures

This Constitution is ratified and effective as of February 26, 2026.

```text
Project: Apolaki Solar Platform
Version: 1.0
Status:  RATIFIED
```

---

*"Build it right, or don't build it."*
