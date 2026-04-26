# Apolaki Solar Platform - Phase 2 Product Requirements Document

**Version**: 1.0  
**Status**: Planning  
**Timeline**: Q1-Q2 2027 (26 weeks post-MVP)  
**Last Updated**: February 26, 2026

## Overview

Phase 2 represents the expansion of Apolaki from a single-domain solar platform into a comprehensive, multi-domain renewable energy ecosystem. This phase introduces support for wind and hydro energy, AI-powered trading capabilities, mobile native applications, international expansion, and white-label enterprise solutions.

## Strategic Vision

**"The unified operating system for renewable energy"** - Apolaki becomes the central platform for managing all forms of renewable energy generation, trading, optimization, and monetization.

## Phase 2 Goals

### Primary Objectives

1. **Multi-Domain Architecture** - Add Wind & Hydro services with same scalability
2. **AI-Powered Trading** - Enable users to trade excess energy on marketplace
3. **Mobile Native Apps** - iOS & Android apps with full feature parity
4. **International Expansion** - Support multiple countries & currencies
5. **Enterprise White-Label** - Customizable platform for utilities & aggregators
6. **Grid Integration** - Connect to smart grid systems & demand response
7. **Carbon Trading** - Monetize carbon credits & offsets

### Ambitious Targets

| Metric | Target | Phase 1 |
|--------|--------|---------|
| Total Users | 1,000,000 | 100,000 |
| Active Energy Traders | 50,000 | 0 |
| Energy Traded (MWh/year) | 500,000 | 0 |
| Countries Supported | 15 | 1 |
| Enterprise Deployments | 50 | 0 |
| Carbon Offsets Certified | 1M tons CO2eq | 0 |
| API Calls/Day | 10B | 100M |

## Domain Expansion

### 1. Wind Energy Service

```
Feature: Wind Installation Monitoring
As a wind farm operator
I want to monitor and optimize wind turbine performance
So that I can maximize energy production and profitability

Acceptance Criteria:
- Real-time turbine performance monitoring
- Wind speed & direction tracking
- Blade pitch optimization recommendations
- Maintenance alerts & predictive maintenance
- Production forecasting
- Fault detection & diagnostics
- Multi-turbine portfolio view
- ROI calculations for wind systems
```

**Architecture:**
```
wind-service/
├── cmd/
├── internal/
│   ├── domain/
│   │   ├── turbine.go
│   │   ├── forecast.go
│   │   └── maintenance.go
│   ├── handlers/
│   ├── services/
│   └── repositories/
├── api/
│   └── proto/
│       └── wind_service.proto
└── tests/
```

**Key Metrics:**
- Wind speed (m/s)
- Rotor RPM
- Power output (MW)
- Blade angle
- Nacelle temperature
- Vibration levels
- Grid frequency

### 2. Hydro Energy Service

```
Feature: Hydro System Management
As a hydro operator
I want integrated management of hydroelectric systems
So that I can optimize water usage and generation

Acceptance Criteria:
- Reservoir level monitoring
- Flow rate tracking
- Turbine efficiency optimization
- Water usage optimization
- Environmental compliance reporting
- Spillage monitoring
- Grid demand response
- Multi-facility portfolio management
```

**Architecture:**
```
hydro-service/
├── cmd/
├── internal/
│   ├── domain/
│   │   ├── reservoir.go
│   │   ├── turbine.go
│   │   └── environmental.go
│   ├── handlers/
│   ├── services/
│   └── repositories/
├── api/
│   └── proto/
│       └── hydro_service.proto
└── tests/
```

**Key Metrics:**
- Reservoir level (m)
- Inflow rate (m³/s)
- Turbine flow (m³/s)
- Head pressure (m)
- Power output (MW)
- Environmental flow rate
- Spillage volume

### 3. Grid Management Service

```
Feature: Smart Grid Integration
As a utility operator
I want to integrate renewable systems with the smart grid
So that I can balance supply and demand

Acceptance Criteria:
- Real-time grid state monitoring
- Demand forecasting
- Frequency regulation participation
- Voltage optimization
- Load balancing
- Islanding capability
- Microgrid management
- Grid stability analysis
```

**Architecture:**
```
grid-service/
├── cmd/
├── internal/
│   ├── domain/
│   │   ├── node.go
│   │   ├── frequency_regulator.go
│   │   └── demand_response.go
│   ├── handlers/
│   ├── services/
│   └── repositories/
├── api/
│   └── proto/
│       └── grid_service.proto
└── tests/
```

## Advanced Features

### 1. Energy Trading Marketplace

```
Feature: Peer-to-Peer Energy Trading
As a prosumer (producer + consumer)
I want to trade excess energy with other users
So that I can monetize my production

Acceptance Criteria:
- List excess energy for sale
- Browse available energy listings
- Automatic matching (supply/demand)
- Auction-based pricing
- Smart contracts for transactions
- Blockchain verification (optional)
- Payment settlement
- Trading history & analytics
```

**User Stories:**
- Set automated price limits for selling energy
- Receive notifications of matching buyers
- Accept/reject trade offers
- Track energy trading profits
- Compare prices across platforms
- Participate in community energy pools

**Technical Implementation:**
- Distributed ledger for transaction immutability
- Smart contracts (Ethereum/Solana)
- Real-time order matching engine
- Settlement layer integration
- Price oracle service

### 2. AI-Powered Energy Optimization

```
Feature: Machine Learning Energy Optimization
As an energy consumer
I want AI to optimize my energy usage
So that I can reduce costs and environmental impact

Acceptance Criteria:
- Predictive load forecasting
- Dynamic pricing response
- Automatic load shifting recommendations
- Battery charging optimization
- EV charging optimization
- HVAC system optimization
- Real-time cost optimization
- Carbon intensity awareness
```

**Algorithms:**
- Time-series forecasting (LSTM/Transformer)
- Reinforcement learning for optimization
- Anomaly detection for faults
- Clustering for consumption patterns
- Regression for price prediction

### 3. Carbon Credit Management

```
Feature: Carbon Credit Trading & Verification
As an environmental investor
I want to track, verify, and trade carbon credits
So that I can monetize my environmental impact

Acceptance Criteria:
- Automatic carbon credit calculation
- Third-party verification integration
- Credit registry management
- Trading marketplace
- Credit retirement tracking
- ESG reporting
- Carbon offset portfolio
- Blockchain certification
```

### 4. Advanced Battery Management

```
Feature: Smart Battery Orchestration
As a battery owner
I want intelligent battery management
So that I can maximize value and lifespan

Acceptance Criteria:
- Charge/discharge optimization
- Peak shaving recommendations
- Rate arbitrage opportunities
- Battery health monitoring
- Degradation prediction
- Grid services participation
- Warranty tracking
```

### 5. Enterprise Energy Management

```
Feature: Multi-Site Enterprise Platform
As a large enterprise/utility
I want centralized management of all energy assets
So that I can optimize across my portfolio

Acceptance Criteria:
- Multi-site aggregation
- Consolidated billing
- Portfolio-level analytics
- Advanced forecasting
- Custom alert rules
- Role-based access control (granular)
- API for third-party integrations
- Custom KPI dashboards
- Revenue sharing models
```

## Mobile Applications

### iOS App

**Features:**
- Real-time monitoring dashboard
- Push notifications for alerts
- Offline data access
- Biometric authentication
- AR-based system visualization
- Energy trading on-the-go
- Instant quote requests
- Document signing
- Performance analytics

**Technology Stack:**
- SwiftUI for UI
- Combine for reactive programming
- Core Data for offline storage
- StoreKit for in-app purchases

### Android App

**Features:**
- Feature parity with iOS
- Material Design 3
- Real-time notifications
- Offline capabilities
- Authentication methods
- AR system visualization
- Energy marketplace
- Contract management

**Technology Stack:**
- Jetpack Compose for UI
- Kotlin Coroutines
- Room for local storage
- Google Play Billing

**Shared Mobile Infrastructure:**
- Firebase for push notifications
- OneSignal for multi-platform messaging
- Mobile-specific API endpoints
- WebSocket for real-time updates
- Offline-first architecture

## International Expansion

### Supported Markets

**Phase 2A (Wave 1):**
- United States (existing)
- Canada
- Germany
- Australia

**Phase 2B (Wave 2):**
- Spain
- Italy
- Japan
- India

**Phase 2C (Wave 3):**
- Brazil
- South Africa
- Indonesia
- Vietnam

### Localization Features

```
Feature: Multi-Language & Multi-Currency Support
As an international user
I want localized experience in my language and currency
So that I can use the platform confidently

Acceptance Criteria:
- 15+ languages supported
- Localized content & documentation
- Multi-currency pricing & transactions
- Regional compliance support
- Local payment methods
- Regulatory requirement handling
- Cultural adaptation (colors, symbols)
```

**Implementation:**
- i18n framework for translations
- Regional pricing strategies
- Currency conversion API
- Compliance automation
- Regional CDN

### Regional Compliance

- GDPR (EU)
- CCPA (California)
- LGPD (Brazil)
- PIPEDA (Canada)
- Regional energy regulations
- Tax compliance by region
- Energy market regulations

## White-Label Enterprise Solution

```
Feature: White-Label Platform
As an energy utility or aggregator
I want a fully customizable Apolaki platform
So that I can launch my own branded service

Acceptance Criteria:
- Custom branding (colors, logos, fonts)
- Custom domain & SSL
- Standalone data segregation
- Custom features & integrations
- Admin control panel
- Analytics & reporting
- SLA guarantees
- Dedicated support
```

### White-Label Capabilities

1. **Visual Customization**
   - Brand colors, fonts, logos
   - Custom CSS/themes
   - Branded mobile apps
   - Custom email templates

2. **Feature Customization**
   - Enable/disable features
   - Custom workflows
   - Integration connectors
   - Custom reporting

3. **Data & Security**
   - Complete data isolation
   - Custom authentication
   - Private cloud option
   - Data residency options

4. **Operations**
   - Whitelabel admin dashboard
   - User management
   - Billing & invoicing
   - Support escalation

## Advanced Analytics & Intelligence

### Real-Time Analytics Platform

```
Feature: Enterprise Analytics Dashboard
As an analyst/executive
I want deep insights into energy operations
So that I can make data-driven decisions

Acceptance Criteria:
- Real-time KPI dashboards
- Custom metric creation
- Drill-down analysis
- Predictive insights
- Anomaly alerts
- Historical analysis
- Export & scheduling
- Multi-dimensional analysis
```

**Technologies:**
- ClickHouse for analytics
- Apache Superset for visualization
- Kafka for real-time streaming
- Machine learning pipelines

### Intelligence Features

1. **Predictive Analytics**
   - Production forecasting (24h, 7d, 30d)
   - Demand forecasting
   - Price forecasting
   - Fault prediction

2. **Prescriptive Analytics**
   - Optimization recommendations
   - Best practice suggestions
   - Anomaly root cause analysis
   - Action recommendations

3. **Comparative Analytics**
   - Benchmark against peers
   - Performance trends
   - Industry comparisons
   - Efficiency scoring

## Architecture Evolution

### Polyglot Persistence

```
Domain Services Architecture:
├── solar-service (Go)
├── wind-service (Go)
├── hydro-service (Go)
├── grid-service (Go)
├── trading-service (Rust - for performance)
├── analytics-service (Python)
├── carbon-service (Go)
└── enterprise-service (Go)

Data Layer:
├── PostgreSQL (transactional)
├── ClickHouse (analytics)
├── TimescaleDB (time-series)
├── Elasticsearch (search)
├── Redis (cache & streaming)
├── S3/Blob Storage (files)
└── Blockchain (immutable ledger)
```

### Event-Driven Architecture Enhancement

- **Event Broker**: Apache Kafka (instead of RabbitMQ)
- **Event Schema Registry**: Confluent Schema Registry
- **Event Sourcing**: For domain models
- **CQRS**: Command Query Responsibility Segregation
- **Sagas**: For distributed transactions

### Service Mesh

- **Istio** for advanced traffic management
- **Circuit breaking** for fault tolerance
- **Distributed tracing** with Jaeger
- **mTLS** for inter-service security
- **Rate limiting** at mesh level
- **Policy enforcement**

## Security Enhancements

### Advanced Security

1. **Zero-Trust Architecture**
   - Every request authenticated
   - Microservice mTLS
   - API gateway validation

2. **Blockchain for Auditability**
   - Immutable transaction log
   - Smart contract verification
   - Tamper-proof records

3. **Advanced Encryption**
   - End-to-end encryption option
   - Homomorphic encryption for privacy-preserving analytics
   - Hardware security modules (HSM)

4. **Compliance & Certification**
   - SOC 2 Type II
   - ISO 27001
   - HIPAA (for health data integration)
   - Regional security standards

## Performance & Scalability

### Target Metrics

| Metric | Phase 2 Target |
|--------|---|
| API Latency (p95) | < 100ms |
| Throughput | 100K requests/sec |
| Database Queries | < 50ms (p95) |
| Cache Hit Ratio | > 95% |
| Availability | 99.999% (5 nines) |
| Data Processing Latency | < 1 second |
| Mobile App Startup | < 2 seconds |

### Infrastructure Scaling

- **Global CDN** with 100+ edge locations
- **Multi-region deployment** (primary + 3 secondaries)
- **Database sharding** across 10+ shards
- **Kubernetes clusters** in 5 continents
- **Auto-scaling** with predicted load
- **Edge computing** for local data processing

## Team & Organization

### New Hiring

- **10+ Backend Engineers** (specialized domains)
- **5 ML Engineers** (analytics & optimization)
- **4 Mobile Engineers** (iOS/Android)
- **3 DevOps/SRE Engineers**
- **2 Security Engineers**
- **2 Data Engineers** (analytics pipeline)
- **4 Product Managers** (per domain)

### New Centers of Excellence

- AI/ML Center
- Mobile Development Center
- Enterprise Solutions Center
- Security & Compliance Center

## Business Model Evolution

### Revenue Streams

1. **Freemium SaaS**
   - Basic monitoring (free)
   - Advanced analytics ($10/month)
   - Energy trading (% commission)
   - Premium support ($20/month)

2. **Enterprise Licensing**
   - White-label platform ($50K+/year)
   - Custom integrations (services)
   - On-premises deployment (+20% license)

3. **Energy Trading**
   - 2% commission on traded energy
   - Premium listing fees
   - Data insights marketplace

4. **Carbon Credits**
   - Carbon trading commission (1-2%)
   - Verification services
   - Registry management fees

### Financial Projections

| Year | ARR | Users | Margin |
|------|-----|-------|--------|
| 2026 (Phase 1) | $5M | 100K | 30% |
| 2027 (Phase 2) | $50M | 1M | 50% |
| 2028 | $200M | 5M | 60% |

## Risks & Challenges

### Technical Risks

| Risk | Mitigation |
|------|-----------|
| Blockchain integration complexity | Early partnerships with blockchain experts |
| ML model accuracy | Continuous model training & monitoring |
| International data residency | Regional deployment architecture |
| Multi-service coordination | Saga patterns & event sourcing |

### Market Risks

| Risk | Mitigation |
|------|-----------|
| Regulatory changes | Compliance team, legal partnerships |
| Competition from larger players | Niche focus, superior UX |
| Market saturation | Adjacent markets (trading, carbon) |
| Technology disruption | R&D budget allocation |

### Organizational Risks

| Risk | Mitigation |
|------|-----------|
| Team scaling challenges | Strong hiring & culture |
| Knowledge silos | Documentation, mentorship programs |
| Technical debt accumulation | Regular refactoring sprints |

## Success Criteria

### Metrics-Based Success

- [ ] 1M active users globally
- [ ] 50K monthly energy traders
- [ ] 500K MWh traded annually
- [ ] 99.999% uptime maintained
- [ ] < 100ms p95 latency
- [ ] NPS > 65
- [ ] 50+ enterprise deployments
- [ ] Positive unit economics

### Organizational Success

- [ ] Successfully scaled team to 80+ engineers
- [ ] Established all 4 Centers of Excellence
- [ ] Zero critical security incidents
- [ ] Maintained culture with 10x growth
- [ ] Documented architecture & decisions

### Market Success

- [ ] Market leader in renewable energy management
- [ ] Recognized for AI innovation
- [ ] Strong brand presence internationally
- [ ] Industry partnership ecosystem

## Phase 3+ Vision

### Potential Future Directions

1. **Autonomous Energy Management**
   - Fully autonomous grid optimization
   - AI-driven trading without human intervention
   - Self-healing infrastructure

2. **Quantum Computing Integration**
   - Complex optimization problems
   - Real-time risk modeling
   - Pattern recognition at scale

3. **Space-Based Solar**
   - Space solar farm management
   - Orbital transmission systems
   - Ground station coordination

4. **Geothermal & Tidal**
   - Additional renewable sources
   - Deep earth resource management
   - Tidal energy optimization

## Appendices

### A. Technology Stack Summary

**Compute:**
- Go 1.24+, Python 3.12+, Rust 1.75+
- Kubernetes 1.30+, Docker

**Data:**
- PostgreSQL 16, TimescaleDB, ClickHouse
- Kafka, Redis, Elasticsearch

**AI/ML:**
- TensorFlow 2.14, PyTorch 2.2
- Hugging Face, Scikit-learn

**Blockchain:**
- Ethereum/Solana integration
- Smart contract libraries

**Cloud:**
- AWS, Google Cloud, Azure (multi-cloud)
- CDN: Cloudflare, Akamai

### B. Competitive Positioning

**vs. Traditional SCADA Systems:**
- Cloud-native, modern UX
- AI-powered insights
- Multi-technology support
- Trading capabilities

**vs. SolarEdge/Enphase:**
- Open ecosystem
- Multi-technology (not hardware locked)
- Community trading
- Enterprise features

**vs. Tesla Energy:**
- Broader energy types
- Trading marketplace
- International support
- White-label options

---

**Document Version**: 1.0  
**Status**: Strategic Vision  
**Target Approval**: Q2 2026  
**Execution Start**: Q1 2027

# Personas

To align Phase 2 features with real-world users and stakeholders, define the following personas. Each persona includes goals, pain points, success metrics, and the primary flows they interact with.

## Platform Persona (Product / Platform Owner)
- Goal: Grow active user base across domains, ensure platform reliability, increase revenue via trading & enterprise licenses.
- Pain Points: Multi-region compliance, scaling marketplace liquidity, integrating heterogeneous energy assets.
- Success Metrics: MAU, uptime (99.95%+), transaction volume, enterprise deployments.
- Primary Flows: Global configuration, monitoring platform health, enterprise onboarding, marketplace governance.

## User Persona (Prosumer / Residential Commercial User)
- Goal: Monitor generation/consumption, sell excess energy, reduce bills, participate in community pools.
- Pain Points: Complex pricing, unpredictable production, battery degradation concerns.
- Success Metrics: Reduced energy costs, revenue from trades, battery lifecycle metrics.
- Primary Flows: Onboarding -> Device registration -> Monitoring dashboard -> List energy for sale -> Accept trades -> Billing & payouts.

## Dealer Persona (Installer / Reseller)
- Goal: Efficiently install and commission systems, manage quotes and contracts, close sales and service tickets.
- Pain Points: Time-consuming commissioning, manual paperwork, delayed payments.
- Success Metrics: Installation throughput, quote-to-install conversion, SLA compliance.
- Primary Flows: Lead -> Quote -> Contract & financing -> Schedule installation -> Commissioning -> Handover -> Post-sale service.

## Operations Persona (Field Operations / Maintenance Engineer)
- Goal: Rapidly detect and resolve faults, optimize fleet performance, manage scheduled maintenance.
- Pain Points: Alert fatigue, noisy telemetry, coordinating field crews.
- Success Metrics: Mean time to repair (MTTR), number of prevented failures, maintenance SLAs.
- Primary Flows: Alert triage -> Diagnostics -> Dispatch crew -> Apply fix -> Verify & close.

## Admin Persona (Organization Admin)
- Goal: Manage users, roles, and organization-level settings; oversee billing and compliance.
- Pain Points: Granular RBAC needs, auditability, multi-tenant isolation.
- Success Metrics: Admin task completion time, audit log completeness, security incidents.
- Primary Flows: Invite users -> Assign roles -> Configure org settings -> Review audits & billing.

## Super Admin Persona (Break-Glass Emergency Admin)
- Goal: Perform critical interventions in emergencies across tenants (security incidents, mass outages).
- Pain Points: High-risk operations, accountability, restricting access to only when necessary.
- Success Metrics: Speed and correctness of emergency actions, post-incident audit clarity.
- Primary Flows (Break-Glass): Declare emergency -> Temporary elevated access with MFA & justification -> Execute emergency actions -> Revoke access -> Post-incident review and audit logging.

# Curated User Flows

Below are concise, step-by-step flow outlines for the most important user journeys in Phase 2. These should be used to drive UI design, API endpoints, test cases, and acceptance criteria.

## 1) New Prosumer Onboarding (User)
1. User signs up (email/SSO) -> Accepts TOS & chooses region/currency.
2. Add site (address) -> Select system type (solar/wind/hydro) -> Add device(s)/serial numbers.
3. Verify device telemetry (pairing via QR/OTP) -> Initial health check.
4. Configure billing & payout method -> Set trading preferences (auto-sell rules, price limits).
5. Complete onboarding -> Landing dashboard shows live production & estimated revenue.

Acceptance: site appears in dashboard, telemetry streams within 5 minutes, default trading rules applied.

## 2) Dealer Installation & Commissioning (Dealer)
1. Dealer creates installation order -> Uploads quote & contract.
2. Schedule installation -> Field engineer uses mobile app to scan devices and run commissioning checklist.
3. Commissioning runs diagnostics -> System registers with platform -> Owner notified for handover.
4. Post-install validation period (7 days) -> Dealer marks install as complete -> Payment milestone initiated.

Acceptance: Commissioning checklist 100% complete, telemetry signal OK, documents attached.

## 3) Operations Incident Workflow (Operations)
1. Automated alert triggered (telemetry anomaly) -> Alert routed to operations queue.
2. Triage: operations engineer reviews telemetry & diagnostics -> Assign severity.
3. If remote remedy available, apply configuration fix -> Monitor for recovery.
4. If on-site required, dispatch crew -> Record work order and resolution.
5. Close incident -> Root-cause analysis & preventive action scheduled.

Acceptance: Incident closed with RCA attached, MTTR within SLA.

## 4) Marketplace Trading Flow (User / Platform)
1. User lists excess capacity with price & time window -> Order posted to marketplace.
2. Matching engine finds buyer(s) -> Notification sent -> Smart contract prepared.
3. Buyer accepts or auction completes -> Settlement orchestrated via settlement layer.
4. Energy delivery verified by metering -> Funds released to seller minus fees.
5. Trade recorded on ledger, user sees P&L in analytics.

Acceptance: Settlement completed within agreed SLA and trade appears in history.

## 5) Admin & Break-Glass Flow (Admin / Super Admin)
1. Admin handles normal user & org management tasks via RBAC UI.
2. For emergencies, super admin initiates break-glass with multi-factor unlock and justification.
3. Emergency actions are scoped, logged, and time-limited.
4. After remediation, actions are reviewed; access revoked; incident logged in system.

Acceptance: Break-glass events require justification, are immutable in audit logs, and expire automatically.

# Updated End-to-End System Flow (High Level)

This sequence shows system components and key handoffs for a combined scenario: a dealer installs a site for a prosumer who then lists energy to the marketplace and a trading match causes settlement.

1. Dealer creates installation order via Dealer Portal (frontend -> backend API).
2. Field engineer commissions device (mobile app -> device gateway -> telemetry ingestion service).
3. Telemetry stored in time-series DB and indexed in event store; monitoring service evaluates KPIs.
4. Owner configures trading preferences in UI -> Trading service stores limits & policies.
5. Excess energy detected by ingestion service -> Optimization service predicts surplus -> Trading service auto-lists.
6. Marketplace matching engine finds buyer -> Smart contract prepared in blockchain service (or ledger service).
7. Meter verification executed by verification service -> Settlement initiated in settlement service (payments gateway).
8. Accounting service logs revenue & updates user balance -> Payout scheduled to user’s payout method.
9. Notifications & receipts sent (email/sms/push) -> Analytics updated for platform metrics.
10. Auditing & compliance module records immutable transaction and administrative actions.

# Testing Plan (End-to-End + CI)

Goals: Validate full stack flows (frontend, backend, integrations) for key journeys: onboarding, commissioning, trading, incident management, and admin break-glass.

Test types and targets:
- Unit tests: all services (goal 90%+ coverage for core modules).
- Integration tests: trading engine, settlement layer, device ingestion, and external APIs (mocked where necessary).
- End-to-end tests: User onboarding -> Commissioning -> Trading -> Settlement.
- Security tests: RBAC, break-glass controls, MFA, audit log immutability.
- Performance tests: load tests for ingestion & trading (target API calls/day scaling validation).

Local E2E checklist (developer):
1. Start local services (see /dev-setup.sh and scripts/dev scripts).
2. Seed demo data (seeds/ README) -> run seeds script.
3. Start frontend dev server: cd frontend && npm install && npm run dev.
4. Run e2e tests: cd tests && npm install && npm run e2e (uses helpers/driverFactory.js).
5. Validate results, fix failures, and re-run.

CI pipeline (recommended):
- Run unit & lint checks.
- Build backend & run integration tests in containers (use docker-compose.test).
- Build frontend and run headless e2e tests (Playwright / Cypress in CI).
- On success, publish artifacts and trigger Netlify deploy for frontend and appropriate deployment for backend (helm/k8s).

Sample GitHub Actions job snippet (concept):
- name: CI Build & E2E
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 18
    - run: npm ci && npm run lint && npm test
    - name: Build frontend
      working-directory: frontend
      run: npm ci && npm run build
    - name: Run e2e tests
      run: npm --prefix tests ci && npm --prefix tests run e2e
    - name: Deploy to Netlify
      if: success()
      uses: netlify/actions/cli@master
      with:
        args: deploy --dir=frontend/dist --prod
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

# Netlify Deployment & Staging Strategy

We already have a `netlify.toml` at the repo root. Recommended deployment pattern:

1. Staging site: Deploy from `develop` branch to Netlify staging site. Set NETLIFY_SITE_ID_STAGING.
2. Production site: Deploy from `main` (or `production`) branch to production Netlify site. Set NETLIFY_SITE_ID.
3. Use GitHub Actions or Netlify native Git integration. Prefer GitHub Actions for coordinated backend->frontend deploys.

Netlify CI notes:
- Build command: cd frontend && npm ci && npm run build
- Publish directory: frontend/dist
- Environment variables: API_BASE_URL (staging/prod), REGION, FEATURE_FLAGS
- For atomic releases, deploy backend first (helm apply), then frontend (Netlify deploy) so UI points at healthy APIs.

# E2E Test Cases (short list)
1. Onboarding happy path: signup -> add site -> device telemetry visible.
2. Dealer commissioning: create install order -> commission devices -> telemetry OK.
3. Trading happy path: auto-list surplus -> match buyer -> settlement success.
4. Incident response: telemetry anomaly -> operations triage -> remote fix.
5. Admin break-glass: super admin activates emergency -> performs scoped action -> logs captured.

# Next Steps / Actions
- Product: review personas & acceptance criteria, confirm metrics and SLAs.
- Eng: convert curated flows into API contracts and UI wireframes; implement end-to-end tests for each flow.
- QA: create test data sets and schedule load tests for ingestion/trading.
- DevOps: add GitHub Actions secrets for Netlify and configure staging/production sites.
