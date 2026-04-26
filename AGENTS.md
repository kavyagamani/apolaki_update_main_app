# Apolaki Solar Platform — AI Agent Operating Guidelines

**Version**: 1.0
**Status**: Active
**Last Updated**: February 26, 2026
**Applies To**: All AI agents, copilots, and automated tooling operating within this repository

---

## ⚠️ Single Source of Truth

**ALL system documentation is consolidated in `DOCUMENTATION.md`**

This file (`AGENTS.md`) contains **code and standards guidelines** only.  
For system overview, setup, deployment, and API reference: → see **`DOCUMENTATION.md`**

| Need | See |
|------|-----|
| System overview, architecture, setup | `DOCUMENTATION.md` |
| Development setup, local installation | `DOCUMENTATION.md` |
| Deployment, environments, Docker | `DOCUMENTATION.md` |
| API endpoints, database schema | `DOCUMENTATION.md` |
| Environment variables, configuration | `DOCUMENTATION.md` |
| **Code standards, SOLID, security rules** | **`AGENTS.md` (this file)** |
| **Implementation patterns** | **`AGENTS.md` (this file)** |
| **Naming conventions, testing** | **`AGENTS.md` (this file)** |
| Governance, values, principles | `CONSTITUTION.md` |
| How to contribute | `CONTRIBUTING.md` |

---

## Purpose

This document defines the rules, constraints, and behavioral expectations for any AI agent (GitHub Copilot, custom GPT agents, CI bots, code-generation tools) working on the Apolaki Solar Platform codebase. Every code suggestion, refactor, or generation **must** comply with these guidelines. Violations should be flagged, not shipped.

---

## 1. Foundational Principles

### 1.1 SOLID Principles — Non-Negotiable

Every module, class, service, and component **must** adhere to SOLID:

| Principle | Rule | Violation Example |
|-----------|------|-------------------|
| **S — Single Responsibility** | Each file/module/class/component owns exactly one reason to change. A Vue component renders UI *or* manages state — never both inline. A Go handler delegates to a service; it never queries the DB directly. | A `Dashboard.vue` that fetches data, transforms it, and renders charts all in one `<script>` block. |
| **O — Open/Closed** | Extend behavior through composition, plugins, middleware, or strategy patterns — never by modifying existing stable code. New energy domains (wind, hydro) are added as new services, not patched into `solar-service`. | Adding a `if domain == "wind"` branch inside `solar_service.go`. |
| **L — Liskov Substitution** | Any implementation of an interface must be a drop-in replacement. Go interfaces must be satisfied fully. Vue components sharing a prop contract must behave identically given the same props. | A `PaymentProvider` implementation that silently ignores the `Refund()` method. |
| **I — Interface Segregation** | Interfaces must be small and role-specific. Prefer many narrow interfaces over one fat interface. Go interfaces should rarely exceed 3 methods. | A single `Repository` interface with 20 methods spanning CRUD, search, analytics, and reporting. |
| **D — Dependency Inversion** | High-level modules depend on abstractions, not concrete implementations. Services accept interfaces. Vue components consume stores/composables, not raw `fetch()` calls. | A Go handler that directly instantiates `*sql.DB` and runs queries. |

**Agent Rule**: Before generating any code, verify that each new function, struct, component, or module satisfies all five SOLID principles. If a generation would violate one, refactor the approach.

---

### 1.2 MECE — Mutually Exclusive, Collectively Exhaustive

All system decomposition **must** follow the MECE principle:

#### Mutually Exclusive (No Overlap)

| Boundary | Rule |
|----------|------|
| **Services** | Each microservice owns exactly one domain. `solar-service` owns solar monitoring, marketplace, contracts, and finance for solar. `wind-service` (Phase 2) owns wind. No domain logic leaks across service boundaries. |
| **Layers** | Presentation logic lives in `frontend/` only. Business logic lives in `middleware/` only. Data access lives in repositories only. No layer may reach into another's responsibilities. |
| **Stores** | Each Pinia store owns one domain slice. `installationStore` owns installation state. `userStore` owns auth state. No store reads or mutates another store's state directly. |
| **Database Tables** | Each table has a single authoritative owner service. No two services write to the same table. Read replicas are acceptable via events/views. |
| **Routes** | Each API route prefix maps to exactly one handler group. `/api/solar/*` → solar handlers. `/api/marketplace/*` → marketplace handlers. No endpoint is served by two handlers. |
| **Components** | Each Vue component has a single visual/behavioral purpose. `Card.vue` renders a card. `Modal.vue` renders a modal. No component is a "kitchen sink" of unrelated UI. |

#### Collectively Exhaustive (No Gaps)

| Area | Rule |
|------|------|
| **Error Handling** | Every code path must handle: success, expected errors (validation, not-found, conflict), unexpected errors (500), and timeout/network errors. No unhandled promise rejections. No uncaught panics in Go. |
| **API Responses** | Every endpoint must document and return all possible HTTP status codes. 2xx for success, 4xx for client errors with descriptive messages, 5xx for server errors with correlation IDs. |
| **Input Validation** | Every external input (request body, query param, URL param, header, file upload) must be validated at the boundary. No raw user input reaches business logic or database. |
| **Test Coverage** | Every public function, handler, service method, and component must have at least one unit test for the happy path and one for the primary failure path. Target: 80%+ line coverage. |
| **Documentation** | Every exported Go function has a doc comment. Every Vue component has a JSDoc or `<docs>` block describing its props, events, and slots. Every API endpoint is in the OpenAPI spec. |

**Agent Rule**: When generating a module, verify that (a) it does not duplicate responsibility held by an existing module, and (b) together with existing modules it covers the full requirement space. If there is a gap, create the missing piece. If there is overlap, refactor to eliminate it.

---

### 1.3 Three-Tier Architecture — Strict Enforcement

```
┌──────────────────────────────────────────────────────┐
│  TIER 1 — PRESENTATION (frontend/)                   │
│  Vue.js 3 · Vite · Pinia · Tailwind CSS             │
│  Responsibility: Rendering, user interaction, state  │
│  management, client-side validation, routing         │
│  NEVER: Direct DB access, business rule evaluation,  │
│  secret storage, server-side auth decisions           │
├──────────────────────────────────────────────────────┤
│  TIER 2 — APPLICATION / BUSINESS LOGIC (middleware/) │
│  Go 1.21+ (solar-service) · Node.js (db-service)    │
│  Responsibility: Domain logic, orchestration, auth,  │
│  authorization, input sanitization, event publishing │
│  NEVER: Direct HTML rendering, SQL string concat,    │
│  storing state in memory across requests              │
├──────────────────────────────────────────────────────┤
│  TIER 3 — DATA (PostgreSQL · Redis · S3 · MQ)       │
│  Responsibility: Persistence, caching, indexing,     │
│  event streaming, file storage                       │
│  NEVER: Business rule enforcement, auth decisions,   │
│  direct exposure to the internet                      │
└──────────────────────────────────────────────────────┘
```

#### Tier Boundary Rules

| From → To | Allowed | Forbidden |
|-----------|---------|-----------|
| Tier 1 → Tier 2 | REST/HTTP, WebSocket, GraphQL via API client (`services/api.js`) | Direct DB connections, importing Go/Node modules |
| Tier 2 → Tier 3 | ORM (GORM), parameterized queries, Redis client, S3 SDK, MQ publisher | Raw SQL string interpolation, exposing DB credentials to Tier 1 |
| Tier 1 → Tier 3 | **NEVER** | All paths — no frontend-to-database communication |
| Tier 2 → Tier 1 | Push via WebSocket, SSE | Importing Vue components, manipulating DOM |

**Agent Rule**: If any generated code crosses a tier boundary in a forbidden direction, reject the approach and restructure. There are zero exceptions.

---

### 1.4 OWASP Compliance — Mandatory Security Standards

All code must comply with the [OWASP Top 10 (2021)](https://owasp.org/www-project-top-ten/) and [OWASP Application Security Verification Standard (ASVS)](https://owasp.org/www-project-application-security-verification-standard/). These are not aspirational — they are blocking requirements.

#### A01: Broken Access Control

| Rule | Implementation |
|------|---------------|
| Deny by default | All routes require authentication unless explicitly marked public. Public routes are defined in a whitelist, not a blacklist. |
| Server-side enforcement | Authorization checks happen in middleware Tier 2, never in Tier 1. Frontend hides UI elements for UX, but the server is the authority. |
| RBAC | Use role-based access control. Roles: `admin`, `manager`, `viewer`, `provider`. Check roles in middleware on every request. |
| CORS | Restrict `Access-Control-Allow-Origin` to known frontend origins. Never use `*` in production. |
| Rate limiting | Apply per-user and per-IP rate limits on all endpoints. Stricter limits on auth endpoints (login, register, password reset). |

#### A02: Cryptographic Failures

| Rule | Implementation |
|------|---------------|
| TLS everywhere | All HTTP traffic must be HTTPS. Redirect HTTP → HTTPS. HSTS headers required. |
| Password hashing | Use bcrypt (cost ≥ 12) or Argon2id. Never MD5, SHA-1, or plain SHA-256 for passwords. |
| Secrets management | No secrets in code, `.env` files committed to git, or frontend bundles. Use environment variables injected at runtime or a vault service. |
| Encryption at rest | Sensitive database columns (PII, financial data) must be encrypted. Use AES-256-GCM. |
| JWT | Sign with RS256 or ES256 (asymmetric). Short-lived access tokens (15 min). Refresh tokens stored securely (httpOnly, secure, sameSite cookies). |

#### A03: Injection

| Rule | Implementation |
|------|---------------|
| Parameterized queries | All database queries must use parameterized statements or ORM. GORM handles this — never use `db.Raw()` with string interpolation. |
| Input sanitization | Sanitize all user input before processing. Use allowlists for expected formats. |
| Output encoding | Encode output contextually (HTML, JS, URL, CSS). Vue's template engine handles HTML escaping by default — never use `v-html` with user data. |
| Command injection | Never pass user input to shell commands, `exec()`, or `os.Command()` without strict validation. |
| NoSQL injection | If using any NoSQL stores, validate and sanitize query operators. |

#### A04: Insecure Design

| Rule | Implementation |
|------|---------------|
| Threat modeling | Every new feature must consider abuse scenarios before implementation. |
| Secure defaults | Features are locked down by default and explicitly opened. |
| Separation of concerns | MECE decomposition (§1.2) enforces clean boundaries that limit blast radius. |
| Limit resource consumption | Set maximum request body sizes, file upload limits, pagination limits, query timeouts. |

#### A05: Security Misconfiguration

| Rule | Implementation |
|------|---------------|
| No default credentials | All services must require explicit credential configuration. Remove default accounts. |
| Minimal exposure | Disable server version headers (`X-Powered-By`, `Server`). Disable directory listing. |
| Error messages | Never expose stack traces, SQL errors, or internal paths to clients. Return generic error messages with correlation IDs. |
| Security headers | Set `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Content-Security-Policy`, `Referrer-Policy: strict-origin-when-cross-origin`. |
| Dependency scanning | Run `npm audit` and `go vet`/`govulncheck` in CI. Block merges on critical vulnerabilities. |

#### A06: Vulnerable and Outdated Components

| Rule | Implementation |
|------|---------------|
| Dependency pinning | Pin all dependency versions in `package.json` (exact) and `go.mod`. No floating ranges in production. |
| Automated scanning | Dependabot or Renovate for automated updates. Snyk or Trivy for vulnerability scanning. |
| Minimal dependencies | Before adding a dependency, verify: Is it maintained? Is it necessary? Can the standard library do it? |
| License compliance | Only use dependencies with compatible licenses (MIT, Apache-2.0, BSD). |

#### A07: Identification and Authentication Failures

| Rule | Implementation |
|------|---------------|
| Brute-force protection | Lock accounts after 5 failed attempts (with exponential backoff unlock). |
| Session management | Invalidate sessions on logout, password change, and privilege escalation. |
| Multi-factor authentication | Support TOTP-based MFA. Require MFA for admin roles. |
| Password policy | Minimum 12 characters. Check against breached password lists (Have I Been Pwned API). |
| OAuth security | Validate `state` parameter. Use PKCE for public clients. Verify token signatures. |

#### A08: Software and Data Integrity Failures

| Rule | Implementation |
|------|---------------|
| CI/CD security | Sign commits. Require PR reviews. Run security scans before deploy. |
| Dependency integrity | Verify checksums for all dependencies (`package-lock.json`, `go.sum`). |
| Data integrity | Use database constraints (foreign keys, unique indexes, check constraints). Validate at the application layer too. |

#### A09: Security Logging and Monitoring Failures

| Rule | Implementation |
|------|---------------|
| Audit logging | Log all authentication events, authorization failures, input validation failures, and data access to sensitive resources. |
| Structured logging | Use structured JSON logging with correlation IDs, timestamps, user IDs, and action types. |
| Log protection | Logs must not contain passwords, tokens, PII, or credit card numbers. Mask sensitive fields. |
| Alerting | Alert on: repeated auth failures, privilege escalation attempts, unusual data access patterns. |

#### A10: Server-Side Request Forgery (SSRF)

| Rule | Implementation |
|------|---------------|
| URL validation | Validate and sanitize all URLs provided by users. Use allowlists for external service URLs. |
| Network segmentation | Backend services should not have unrestricted outbound access. Use egress rules. |
| Disable redirects | Do not follow HTTP redirects to user-supplied URLs. |

**Agent Rule**: Before generating any code that handles user input, authentication, data access, or external communication, verify compliance with all applicable OWASP rules above. If a shortcut is tempting, reject it.

---

## 2. Technology-Specific Agent Rules

### 2.1 Frontend (Vue.js 3 / Vite / Pinia / Tailwind CSS)

```
ALWAYS:
  - Use Composition API (<script setup>) for all new components
  - Use Pinia stores for shared state — never component-level global state
  - Use the api.js service layer for all HTTP calls — never raw fetch/axios in components
  - Use Tailwind utility classes — avoid custom CSS unless for design-system tokens
  - Use Vue Router for navigation — never window.location manipulation
  - Use v-model for two-way binding — never manual event + prop mirroring
  - Lazy-load routes and heavy components (dynamic imports)
  - Provide loading and error states for every async operation

NEVER:
  - Use v-html with user-supplied content
  - Store secrets, tokens, or API keys in frontend code
  - Import backend modules or access databases from frontend
  - Use inline styles for layout (use Tailwind)
  - Mutate props directly — emit events instead
  - Use any global mutable state outside Pinia
```

### 2.2 Middleware — Go (solar-service)

```
ALWAYS:
  - Follow handler → service → repository layering
  - Define interfaces for all service and repository dependencies
  - Use dependency injection (constructor injection via structs)
  - Use GORM with parameterized queries — never raw SQL interpolation
  - Return structured errors with HTTP status codes and correlation IDs
  - Use context.Context for cancellation and timeout propagation
  - Write table-driven tests for all service methods
  - Use zap for structured logging

NEVER:
  - Import handler packages from service packages (dependency inversion)
  - Use global variables for stateful dependencies (DB, logger)
  - Panic in request-handling code — always return errors
  - Use fmt.Sprintf to build SQL queries
  - Log passwords, tokens, or PII
  - Expose internal error details to the client
```

### 2.3 Middleware — Node.js (netlify-db-service)

```
ALWAYS:
  - Use async/await with proper try/catch
  - Validate all request inputs at the route handler level (joi, zod, or express-validator)
  - Use parameterized queries for all database operations
  - Use helmet for security headers
  - Use cors with explicit origin allowlist
  - Return consistent JSON error format: { error: string, code: string, correlationId: string }
  - Use ConfigManager for all database/service settings (see Section 2.6)
  - NEVER hardcode database credentials, endpoints, or secrets

NEVER:
  - Use eval(), Function(), or dynamic require with user input
  - Use string concatenation for SQL
  - Store sessions in memory (use Redis or DB-backed sessions)
  - Expose stack traces in production responses
  - Trust client-side headers (X-Forwarded-For, etc.) without proxy configuration
  - Hardcode environment-specific configuration
  - Store secrets in code or .env files committed to git
```

### 2.4 Configuration Management (★ NEW)

**All database and service configuration MUST use the ConfigManager pattern. No hardcoding allowed.**

#### Rules

| Rule | Implementation | Violation |
|------|----------------|-----------|
| **No hardcoded credentials** | Load via ConfigManager at startup | `const pw = "password123"` |
| **No fallback to hardcoded values** | Fail loudly if config is missing | `process.env.DB_HOST \|\| "localhost"` |
| **No .env files in production** | Use platform variables (Netlify) or vault | Committing `.env` to git |
| **Inject, never access globals** | Pass config to constructors | Global `process.env` reads |
| **Single source of truth** | ConfigManager is the only config loader | Multiple places reading env vars |
| **Fail fast** | Validate config at startup, exit if invalid | Silent failures with defaults |

#### ConfigManager Architecture

```javascript
// config/ConfigManager.js
class ConfigManager {
  static async load() {
    // Priority order:
    // 1. Environment variables (Netlify platform vars)
    // 2. Vault service (future)
    // 3. Config file (development only, git-excluded)
    // 4. NO defaults for production settings
    
    const config = {
      database: {
        host: process.env.DATABASE_HOST || throw Error('DATABASE_HOST required'),
        port: parseInt(process.env.DATABASE_PORT) || throw Error('DATABASE_PORT required'),
        user: process.env.DATABASE_USER || throw Error('DATABASE_USER required'),
        password: process.env.DATABASE_PASSWORD || throw Error('DATABASE_PASSWORD required'),
        name: process.env.DATABASE_NAME || throw Error('DATABASE_NAME required'),
        pool: parseInt(process.env.DATABASE_POOL_SIZE || '10'),
      },
      cache: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT) || 6379,
        ttl: parseInt(process.env.CACHE_TTL || '3600'),
      },
      security: {
        jwtSecret: process.env.JWT_SECRET || throw Error('JWT_SECRET required'),
        hashCost: parseInt(process.env.BCRYPT_COST || '12'),
      },
      api: {
        port: parseInt(process.env.API_PORT || '3000'),
        timeout: parseInt(process.env.API_TIMEOUT || '30000'),
        rateLimit: {
          windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'),
          maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100'),
        },
      },
    };
    
    // Validate critical config
    this.validate(config);
    return config;
  }
  
  static validate(config) {
    if (!config.database.host) throw Error('Invalid config: database.host');
    // ... more validation
  }
}

module.exports = ConfigManager;
```

#### Service Constructor Injection

```javascript
// services/AuthService.js
class AuthService {
  constructor(config, repository) {
    // Config injected, NOT from process.env
    this.dbConfig = config.database;
    this.securityConfig = config.security;
    this.repository = repository;
  }
  
  // Use this.securityConfig.jwtSecret, NEVER process.env directly
  async generateToken(userId) {
    return jwt.sign(
      { userId },
      this.securityConfig.jwtSecret,
      { expiresIn: '15m' }
    );
  }
}

module.exports = AuthService;
```

#### Startup Pattern

```javascript
// index.js or server.js
const ConfigManager = require('./config/ConfigManager');
const AuthService = require('./services/AuthService');
const UserRepository = require('./repositories/UserRepository');

async function startServer() {
  // Load config at startup, fail if invalid
  const config = await ConfigManager.load();
  console.log('✓ Configuration loaded successfully');
  
  // Pass config to all service constructors
  const userRepo = new UserRepository(config.database);
  const authService = new AuthService(config, userRepo);
  
  // Start server
  const app = setupExpress(config);
  app.use('/api/auth', authRoutes(authService));
  
  app.listen(config.api.port, () => {
    console.log(`Server running on port ${config.api.port}`);
  });
}

startServer().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
```

#### Netlify Environment Variables

**In Netlify Dashboard → Site Settings → Build & Deploy → Environment**:

```
DATABASE_HOST = apolaki-db.example.com
DATABASE_PORT = 5432
DATABASE_USER = app_user
DATABASE_PASSWORD = [secure password]
DATABASE_NAME = apolaki_prod
REDIS_HOST = apolaki-redis.example.com
REDIS_PORT = 6379
JWT_SECRET = [secure JWT signing key]
BCRYPT_COST = 12
API_PORT = 3000
```

**Zero-downside deployment**: Same Docker image with different env vars = dev, staging, production.

### 2.5 Database (PostgreSQL)

```
ALWAYS:
  - Use migrations (versioned, reversible) for all schema changes
  - Add foreign key constraints for referential integrity
  - Add NOT NULL constraints where appropriate — default to NOT NULL
  - Add CHECK constraints for value ranges and enums
  - Index columns used in WHERE, JOIN, and ORDER BY clauses
  - Use UUIDs for primary keys on public-facing entities
  - Partition time-series data (monitoring_data) by month

NEVER:
  - Store passwords in plain text — always hash
  - Store sensitive data (SSN, credit card) without encryption
  - Use CASCADE DELETE without explicit documentation of impact
  - Grant superuser to application accounts — use least-privilege roles
  - Allow direct database access from the frontend tier
```

```
ALWAYS:
  - Use migrations (versioned, reversible) for all schema changes
  - Add foreign key constraints for referential integrity
  - Add NOT NULL constraints where appropriate — default to NOT NULL
  - Add CHECK constraints for value ranges and enums
  - Index columns used in WHERE, JOIN, and ORDER BY clauses
  - Use UUIDs for primary keys on public-facing entities
  - Partition time-series data (monitoring_data) by month

NEVER:
  - Store passwords in plain text — always hash
  - Store sensitive data (SSN, credit card) without encryption
  - Use CASCADE DELETE without explicit documentation of impact
  - Grant superuser to application accounts — use least-privilege roles
  - Allow direct database access from the frontend tier
```

---

## 3. Deployment & Build Configuration Agent Rules

### 3.1 Separate Deployables (★ NEW)

The system has **independent frontend and backend deployables**. Agents must respect this separation:

| Deployable | Location | Responsibility | Deploy Independent |
|-----------|----------|-----------------|-------------------|
| Frontend | `frontend/` | Vue.js app, static assets | ✅ YES — No backend required |
| Backend | `middleware/` | Go & Node services | ✅ YES — No frontend required |
| Data | External services | DB, cache, message queue | ✅ YES — Shared by both |

**Agent Rule**: When making changes:
- Frontend changes **must NOT** require backend changes
- Backend changes **must NOT** require frontend changes
- Use API versioning and contracts to decouple them
- Configuration is the **only coupling** point (shared config, not shared code)

### 3.2 Build Configuration

#### Frontend Build (`frontend/vite.config.js`)

```javascript
ALWAYS:
  - Source maps disabled in production
  - CSS minified and bundled
  - JavaScript minified and tree-shaken
  - Dynamic imports for route-level code splitting
  - Environment variables injected via .env (development) or build process (CI/CD)
  - API_URL configurable: import.meta.env.VITE_API_URL

NEVER:
  - Hardcode API endpoints — always read from environment
  - Include backend code in frontend bundle
  - Store secrets in frontend code or assets
  - Output sensitive information to console in production
```

#### Backend Build (Dockerfile)

```dockerfile
ALWAYS:
  - Multi-stage build (build stage + runtime stage)
  - Runtime stage includes ONLY necessary binaries and configs
  - No source code in runtime image
  - Configuration loaded at container startup (ConfigManager)
  - Health check endpoint included
  - Signals handled gracefully (SIGTERM, SIGINT)
  
NEVER:
  - Include .env files in image
  - Hardcode credentials, keys, or secrets
  - Run as root user
  - Copy entire node_modules or vendor directories (use COPY package.json + npm install)
```

### 3.3 Netlify Combined Deployment

**Single `netlify.toml` file orchestrates both frontend and backend.**

```toml
ALWAYS:
  - Frontend builds to frontend/dist
  - Backend functions in middleware/netlify-db-service/functions
  - Environment variables defined in Netlify dashboard (NOT in toml)
  - Build command runs: npm run test:all before deploy
  - Publish directory is frontend/dist (static assets)
  - API functions use /api/* routes (configured in toml)

NEVER:
  - Include secrets in netlify.toml
  - Hardcode environment-specific settings
  - Use build.publish without frontend/dist
  - Deploy backend without running tests first
```

**Agents MUST ensure netlify.toml includes**:

```toml
[build]
  command = "npm run build:all"        # Runs both frontend & backend builds
  publish = "frontend/dist"           # Static frontend assets

[[functions]]
  directory = "middleware/netlify-db-service/functions"
  node_bundler = "esbuild"

[build.environment]
  # NO SECRETS HERE — use Netlify dashboard instead
  NODE_ENV = "production"
  
[functions]
  included_files = ["middleware/**"]
  
[context.production]
  [context.production.env]
    # All secrets from Netlify platform env vars, not here
    
[redirects]
  # Redirect API calls to functions
  [[redirects]]
    from = "/api/*"
    to = "/.netlify/functions/:splat"
    status = 200
    force = false
```

### 3.4 Environment Variables Policy

| Variable Type | Where Set | Injected How | Never In |
|---------------|-----------|-------------|---------|
| Public (API endpoint) | CI/CD pipeline | Build time | Code |
| Internal (database URL) | Netlify dashboard | Platform env var | Code, .env, git |
| Secrets (JWT, passwords) | Netlify dashboard | Platform env var | Code, .env, git, frontend |
| Feature flags | CI/CD pipeline | Build time | Code |

**Agent Rule**: If an agent wants to add a new environment variable:
1. Declare it in ConfigManager
2. Add to .env.example (WITHOUT the value)
3. Document in DOCUMENTATION.md § Configuration Management
4. NEVER commit actual values to git
5. Netlify deployment sets actual values via dashboard

### 3.5 Container Configuration (Docker)

```dockerfile
# Dockerfile (middleware/Dockerfile)
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY src ./src
COPY config ./config
# NO .env file
# NO hardcoded credentials
ENV NODE_ENV=production
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"
CMD ["node", "src/index.js"]
```

**ConfigManager loads config at container startup** — same image runs in dev, staging, production with different env vars.

---

## 3. File & Module Naming Conventions

| Layer | Convention | Example |
|-------|-----------|---------|
| Vue Components | PascalCase `.vue` | `SolarDashboard.vue`, `MarketplaceCard.vue` |
| Vue Views (pages) | PascalCase `.vue` | `Dashboard.vue`, `Assessment.vue` |
| Pinia Stores | camelCase with `Store` suffix | `installationStore.js`, `userStore.js` |
| JS Services | camelCase `.js` | `api.js`, `websocket.js` |
| JS Utilities | camelCase `.js` | `formatters.js`, `validators.js` |
| Go Packages | lowercase, single word | `handlers`, `services`, `repositories` |
| Go Files | snake_case `.go` | `solar_service.go`, `marketplace_repo.go` |
| Go Interfaces | PascalCase with `-er` suffix where natural | `MonitoringService`, `ProductRepository` |
| SQL Migrations | `YYYYMMDD_HHMMSS_description.sql` | `20260226_120000_add_teams_table.sql` |
| Test Files | Same name + `_test` suffix | `solar_service_test.go`, `Button.test.js` |
| Config Files | kebab-case or dot notation | `docker-compose.yml`, `vite.config.js` |

---

## 4. Code Generation Checklist

Before submitting any generated code, the agent **must** verify:

### Architecture
- [ ] Code lives in the correct tier (Presentation / Application / Data)
- [ ] No tier boundary violations
- [ ] Module has a single, clear responsibility (S in SOLID)
- [ ] No overlap with existing modules (ME in MECE)
- [ ] All related requirements are covered (CE in MECE)

### Security (OWASP)
- [ ] All user input is validated and sanitized
- [ ] No secrets hardcoded or exposed to the client
- [ ] Authentication and authorization are enforced server-side
- [ ] Parameterized queries for all database operations
- [ ] Proper error handling that does not leak internal details
- [ ] Security headers are set on all responses

### Quality
- [ ] Code follows the naming conventions (§3)
- [ ] Unit tests are included for new functions/methods
- [ ] Error paths are handled (not just happy path)
- [ ] Code compiles / lints cleanly (`npm run lint`, `go vet`)
- [ ] Documentation is updated (JSDoc, Go doc comments, OpenAPI)

### Performance
- [ ] No N+1 query patterns
- [ ] Pagination for list endpoints (default limit: 20, max: 100)
- [ ] Heavy operations are async/background where possible
- [ ] Frontend components are lazy-loaded where appropriate

---

## 5. Prohibited Patterns

The following patterns are **banned**. Agents must never generate them:

| Pattern | Why It's Banned | What to Do Instead |
|---------|----------------|-------------------|
| `v-html` with user data | XSS vulnerability (OWASP A03) | Use text interpolation `{{ }}` or a sanitization library |
| `db.Raw("SELECT * FROM users WHERE id = " + id)` | SQL injection (OWASP A03) | Use `db.Where("id = ?", id)` or GORM methods |
| `eval()` / `Function()` with user input | Code injection (OWASP A03) | Use structured parsing (JSON.parse, etc.) |
| Storing JWT in `localStorage` | XSS token theft (OWASP A07) | Use httpOnly, secure, sameSite cookies |
| `console.log(password)` or `log.Info("token", token)` | Credential exposure (OWASP A09) | Never log secrets; mask sensitive fields |
| `Access-Control-Allow-Origin: *` in production | CORS bypass (OWASP A01) | Whitelist specific origins |
| God objects / god components (>300 lines) | Violates SRP (SOLID S) | Decompose into focused units |
| Circular imports between layers | Violates DIP (SOLID D) | Use interfaces and dependency injection |
| `catch(err) {}` (empty catch) | Swallowed errors, invisible failures | Log, re-throw, or handle meaningfully |
| `any` type in TypeScript / untyped in Go | Type-safety erosion | Use proper types, interfaces, structs |

---

## 6. Decision Framework for Agents

When facing an ambiguous design decision, apply this priority order:

1. **Security** — Never compromise security for speed or convenience
2. **Correctness** — Correct behavior over performance optimization
3. **Maintainability** — Clear, readable code over clever code
4. **Performance** — Optimize only after measuring; never prematurely
5. **Brevity** — Concise is good, but not at the expense of clarity

When choosing between two approaches:
- Prefer the approach that is **more testable**
- Prefer the approach that **limits blast radius** (smaller scope of change)
- Prefer the approach that **uses existing patterns** in the codebase
- Prefer the approach that **the OWASP and SOLID guidelines** explicitly support

---

## 7. Cross-Reference

| Document | Relationship |
|----------|-------------|
| [CONSTITUTION.md](CONSTITUTION.md) | The supreme governing document — AGENTS.md implements its principles |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Defines the system structure that agents must respect |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Human contributor guidelines — agents follow the same standards |
| [docs/API_REFERENCE.md](docs/API_REFERENCE.md) | Canonical API contracts — agents must not deviate |
| [docs/MVP.PRD.md](docs/MVP.PRD.md) | Feature requirements — agents must implement to spec |
| [docs/PHASE1.PRD.md](docs/PHASE1.PRD.md) | Phase 1 roadmap — agents must not scope-creep beyond current phase |

---

**This document is authoritative. If any generated code conflicts with these guidelines, the guidelines win.**
