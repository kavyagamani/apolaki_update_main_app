# Apolaki Solar Platform - MVP Product Requirements Document

**Version**: 1.0  
**Status**: Active  
**Release Target**: Q2 2026  
**Last Updated**: June 2025 (Audit Complete)

## Executive Summary

Apolaki MVP is a web-based solar energy management platform that enables residential and small commercial users to monitor their solar installations, explore solar marketplace options, assess financial viability, and manage contracts. The MVP focuses on core functionality with a clean, intuitive user interface.

## Vision

Empower individuals and small businesses to make informed solar energy decisions through a unified platform that combines real-time monitoring, marketplace discovery, financial analysis, and contract management.

## Core Value Propositions

1. **Real-time Monitoring** - Track solar installation performance in real-time
2. **Informed Decisions** - Access marketplace options and financial assessments
3. **Simplified Management** - Manage contracts and financing in one place
4. **User Education** - Learn about solar energy and ROI

## Goals & Success Metrics

### Primary Goals
- [ ] Achieve 95%+ uptime
- [ ] Support 10,000+ concurrent users
- [ ] Process 1M+ daily monitoring data points
- [ ] 10,000 marketplace product listings
- [ ] 500+ successfully signed contracts

### Success Metrics
| Metric | Target | Threshold |
|--------|--------|-----------|
| Page Load Time | < 3 seconds | p95 |
| API Response Time | < 200ms | p95 |
| Dashboard Update Latency | < 500ms | Real-time data |
| System Uptime | 99.95% | Monthly |
| User Growth | 100 users/week | MVP phase |
| Contract Completion Rate | 60% | Of initiated |
| User Satisfaction (NPS) | > 40 | Post-launch |

## Target Users

### Primary User Personas

**1. Homeowner - Solar Explorer**
- Age: 35-55
- Tech Savvy: Moderate
- Goal: Understand solar ROI for home
- Pain Point: Confusion about options and costs

**2. Small Business Owner - Energy Manager**
- Age: 30-60
- Tech Savvy: Moderate to High
- Goal: Reduce energy costs, track performance
- Pain Point: Complex monitoring and reporting

**3. Environmental Advocate - Sustainability Seeker**
- Age: 25-45
- Tech Savvy: High
- Goal: Track carbon offset, optimize green energy
- Pain Point: Limited transparency on impact

## Features & User Stories

### 1. Authentication & User Management ✅

```
Feature: User Registration & Login
As a new user
I want to create an account and log in
So that I can access my solar data

Acceptance Criteria:
- Email registration with verification ✅
- Password reset functionality ✅
- Social login (Google/Apple) - optional ✅ (Google, Facebook, Instagram, Viber, Telegram)
- Terms of service acceptance ❌ (not implemented — needs checkbox on Signup)
- 2FA support ❌ (excluded from MVP scope)
```

### 2. Dashboard & Real-Time Monitoring ✅ (Complete)

```
Feature: Solar Installation Dashboard
As a solar user
I want to see real-time monitoring of my solar system
So that I can track energy production and savings

Acceptance Criteria:
- Real-time power generation (kW) ✅
- Daily energy production (kWh) ✅
- Monthly/yearly statistics ✅ (time-range selector: 24h, 7d, 30d, yearly)
- Weather conditions impact ✅ (simulated weather widget with solar impact)
- System efficiency percentage ✅
- Estimated savings ($/CO2) ✅ (monthly/yearly savings + CO₂ offset)
- Alerts for system issues ✅ (data-driven: offline, maintenance, weather)
- Interactive charts (24h, 7d, 30d, yearly) ✅ (bar charts + pie chart)
```

### 3. Marketplace ⚠️ (Mostly Complete)

```
Feature: Solar Products & Services Marketplace
As a user exploring solar options
I want to browse solar products and providers
So that I can compare options

Acceptance Criteria:
- Product categories (panels, inverters, batteries) ✅
- Provider directory ❌ (no dedicated provider listing page)
- Product specifications & pricing ✅
- User reviews & ratings (1-5 stars) ✅
- Comparison tool (side-by-side) ✅
- Contact provider button ❌ (not implemented)
- Save to wishlist ✅
- Filter & search functionality ✅
```

### 4. Financial Assessment ✅ (Complete)

```
Feature: Solar Investment Assessment
As a user evaluating solar
I want to understand financial impact
So that I can make informed decisions

Acceptance Criteria:
- Initial cost estimation ✅
- ROI calculation ✅
- Payback period ✅
- 20-year projection ✅
- Financing options (cash, loan, lease) ✅
- Tax incentives database ✅ (federal ITC + state incentives)
- Solar API integration ✅ (Google Solar API → NREL PVWatts → built-in estimate)
- Address/zip/city cascading lookup ✅
- Multiple provider fallback ✅
- Utility savings simulator ❌ (not implemented)
- Export assessment as PDF ❌ (not implemented)
```

### 5. Contract Management ⚠️ (Partial)

```
Feature: Contract Management System
As a user managing solar contracts
I want to view, sign, and track contracts
So that I can manage agreements

Acceptance Criteria:
- Contract templates library ⚠️ (contract types serve as templates)
- E-signature integration ✅ (sign button with status update)
- Contract status tracking ✅
- Document upload capability ❌ (not implemented)
- Signature history ❌ (not implemented)
- Contract search & filtering ✅
- Reminder notifications ❌ (not implemented)
- Audit trail ❌ (not implemented)
```

### 6. User Profile & Settings ⚠️ (Partial)

```
Feature: User Profile Management
As a user
I want to manage my profile and preferences
So that I can control my experience

Acceptance Criteria:
- Profile information editing ✅
- Installation details (system size, location) ❌ (not on profile page)
- Notification preferences ❌ (not implemented)
- Privacy settings ❌ (not implemented)
- Data export (GDPR compliance) ❌ (not implemented)
- Account deletion capability ✅
- Language/timezone preferences ❌ (not implemented)
```

## Technical Specifications

### Platform Requirements

**Frontend:**
- Framework: Vue.js 3 (or React 18+)
- Build: Vite
- Styling: Tailwind CSS
- State: Pinia/Zustand
- HTTP: Axios

**Middleware:**
- Language: Go 1.21+
- Framework: Gin/Echo
- Database Access: GORM

**Backend:**
- Database: PostgreSQL 15+
- Cache: Redis
- Deployment: Docker + Kubernetes

### Browser Support
- Chrome/Edge: Latest 2 versions
- Safari: Latest 2 versions
- Firefox: Latest 2 versions
- Mobile: iOS Safari, Chrome Android

### Performance Requirements
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Time to Interactive: < 3s

## User Interface & Design

### Core Pages/Screens

1. **Landing Page** - Introduction, features, CTA ✅
2. **Login/Register** - User authentication ✅
3. **Dashboard** - Real-time monitoring overview ✅
4. **Installation Management** - Add/edit/delete installations ✅
5. **Marketplace** - Browse products & providers ✅
6. **Assessment Tool** - Financial analysis ✅
7. **Contracts** - Contract management ✅
8. **Profile** - User settings and preferences ✅
9. **About** - Company info, credits, documentation ✅

### Design System

**Color Palette:**
- Primary: Solar Gold (#FFB81C)
- Secondary: Sky Blue (#0066CC)
- Success: Green (#00B050)
- Warning: Orange (#FF9500)
- Error: Red (#E74C3C)
- Neutral: Gray (#F5F5F5)

**Typography:**
- Headings: Inter Bold
- Body: Inter Regular
- Monospace: Courier New

**Components:**
- Button (primary, secondary, danger)
- Card (elevated, outlined)
- Input fields (text, number, select, date)
- Navigation (header, sidebar, breadcrumbs)
- Alerts & toasts
- Modals & drawers
- Charts & graphs

## Data Requirements

### Key Data Points

**Installation Data:**
- System size (kW)
- Panel count & type
- Inverter specs
- Location (lat/long)
- Installation date
- Owner information

**Monitoring Data:**
- Real-time power output (kW)
- Daily energy (kWh)
- Cumulative generation
- Inverter status
- Temperature
- Weather data

**Marketplace Data:**
- Product info (specs, price, reviews)
- Provider details
- Rating/reviews
- Availability
- Shipping info

**Assessment Data:**
- System cost
- Installation cost
- Financing terms
- Local utility rates
- Incentive programs
- Historical performance

**Contract Data:**
- Document content
- Signatures
- Timestamps
- Party information
- Status/stage

## MVP Audit Summary (June 2025)

| Feature | Status | Implemented | Missing |
|---------|--------|-------------|---------|
| 1. Auth & User Mgmt | ✅ Core done | 3/5 | ToS checkbox, 2FA (excluded) |
| 2. Dashboard & Monitoring | ✅ Complete | 8/8 | — |
| 3. Marketplace | ⚠️ Mostly done | 6/8 | Provider directory, Contact provider |
| 4. Financial Assessment | ✅ Complete | 9/11 | Utility savings simulator, PDF export |
| 5. Contract Management | ⚠️ Partial | 3/8 | Doc upload, signature history, reminders, audit trail |
| 6. User Profile | ⚠️ Partial | 2/7 | Installation details, notifications, privacy, data export, lang/tz |

**Overall**: Core user flows work end-to-end. Dashboard monitoring is fully implemented with weather, savings, alerts, and interactive time-range charts. Solar API integration (Google → NREL → built-in) is live with cascading address/zip/city lookup. Profile settings and remaining Marketplace/Contract gaps are next priorities.

## MVP Scope - Included

✅ User authentication (email/password) — IMPLEMENTED  
✅ Single installation monitoring — IMPLEMENTED  
✅ Real-time dashboard with basic charts — IMPLEMENTED  
✅ Marketplace browsing (read-only) — IMPLEMENTED  
✅ Basic financial assessment tool — IMPLEMENTED  
✅ Contract viewing and e-signature — IMPLEMENTED  
✅ Basic profile management — IMPLEMENTED  
✅ Responsive design for desktop & mobile — IMPLEMENTED  
✅ API documentation — IMPLEMENTED  
✅ Basic error handling & validation — IMPLEMENTED  
✅ Landing page with features & CTA — IMPLEMENTED

## MVP Scope - Excluded

❌ Advanced analytics & ML predictions  
❌ Social features (sharing, referrals)  
❌ Integration with utility companies  
❌ Hardware vendor API integrations  
❌ Advanced financing options  
❌ Bulk operations & team management  
❌ White-label / Multi-tenant  
❌ Mobile native apps (web only)  
❌ Advanced security features (2FA, SSO)  
❌ Offline functionality  

## User Flows

### Flow 1: New User Onboarding
```
Landing Page
  ↓
Register/Login
  ↓
Setup Wizard (Location, System Info)
  ↓
Connect Hardware (Optional)
  ↓
Dashboard
  ↓
Explore Marketplace
```

### Flow 2: Monitoring & Insights
```
Dashboard
  ├→ View Real-time Generation
  ├→ Check Daily Stats
  ├→ View Monthly Trends
  └→ Receive Alerts
```

### Flow 3: Contract Signature
```
Marketplace/Assessment
  ↓
Contact Provider
  ↓
Receive Contract
  ↓
Review Contract
  ↓
E-Sign Contract
  ↓
Download Signed Copy
```

## API Endpoints (MVP)

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/password-reset` - Reset password

### Installations
- `GET /api/v1/installations` - List user's installations
- `POST /api/v1/installations` - Create installation
- `GET /api/v1/installations/{id}` - Get installation details
- `PUT /api/v1/installations/{id}` - Update installation
- `DELETE /api/v1/installations/{id}` - Delete installation

### Monitoring
- `GET /api/v1/installations/{id}/current` - Current real-time data
- `GET /api/v1/installations/{id}/daily` - Daily data
- `GET /api/v1/installations/{id}/monthly` - Monthly data
- `GET /api/v1/installations/{id}/yearly` - Yearly data
- `WebSocket /ws/installations/{id}` - Real-time updates

### Marketplace
- `GET /api/v1/marketplace/products` - List products
- `GET /api/v1/marketplace/products/{id}` - Product details
- `GET /api/v1/marketplace/providers` - List providers
- `GET /api/v1/marketplace/providers/{id}` - Provider details
- `GET /api/v1/marketplace/reviews` - Get reviews

### Assessment
- `POST /api/v1/assessment/calculate` - Calculate ROI
- `GET /api/v1/assessment/{id}` - Get assessment
- `POST /api/v1/assessment/{id}/export` - Export as PDF

### Solar API
- `POST /api/v1/solar/lookup` - Lookup solar potential (Google Solar → NREL PVWatts → built-in estimate)

### Contracts
- `GET /api/v1/contracts` - List contracts
- `GET /api/v1/contracts/{id}` - Get contract details
- `POST /api/v1/contracts/{id}/sign` - Sign contract
- `GET /api/v1/contracts/{id}/download` - Download contract

### User Profile
- `GET /api/v1/users/profile` - Get profile
- `PUT /api/v1/users/profile` - Update profile
- `POST /api/v1/users/password` - Change password
- `DELETE /api/v1/users/account` - Delete account

## Release Plan

### Phase 0: Foundation (Weeks 1-2)
- Project setup & tooling
- Database schema design
- API gateway setup
- CI/CD pipeline

### Phase 1: Core Services (Weeks 3-4)
- Authentication service
- Installation management
- User profile management

### Phase 2: Monitoring (Weeks 5-6)
- Real-time monitoring service
- Data ingestion pipeline
- WebSocket implementation
- Dashboard UI

### Phase 3: Marketplace (Weeks 7-8)
- Marketplace service & database
- Product catalog
- Provider directory
- Marketplace UI

### Phase 4: Assessment & Contracts (Weeks 9-10)
- Assessment service
- Financial calculation engine
- Contract management
- E-signature integration

### Phase 5: Testing & Polish (Weeks 11-12)
- QA & bug fixing
- Performance optimization
- Security audit
- Documentation

### Phase 6: Launch (Week 13)
- Production deployment
- Monitoring setup
- Launch marketing
- Post-launch support

## Dependencies & Risks

### External Dependencies
- E-signature provider (DocuSign/HelloSign)
- Weather API (OpenWeather)
- Email service (SendGrid/SES)
- File storage (S3/Google Cloud)
- SMS service (Twilio) - optional

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Hardware integration delays | High | High | Plan APIs early, mock data |
| Real-time data latency | Medium | High | Use WebSocket + Cache |
| Database scalability | Medium | Medium | Sharding strategy |
| Security vulnerabilities | Medium | Critical | Regular audits, penetration testing |

### Mitigation Strategies
- Early vendor engagement
- Load testing in staging
- Security-first development
- Comprehensive testing
- Incremental rollout

## Success Criteria for MVP Launch

- [ ] All core features functional & bug-free
- [ ] System handles 1,000 concurrent users
- [ ] API response times meet SLOs
- [ ] 99.9% uptime in staging
- [ ] Security audit passed
- [ ] Documentation complete
- [ ] User acceptance testing passed
- [ ] Performance targets met
- [ ] Team trained on systems

## Post-Launch (30-90 days)

- Monitor system health & performance
- Gather user feedback
- Plan Phase 1 enhancements
- Identify scaling issues
- Prepare for feature expansion

## Appendices

### A. Glossary
- **kW**: Kilowatt (power output)
- **kWh**: Kilowatt-hour (energy produced)
- **ROI**: Return on Investment
- **SLA**: Service Level Agreement
- **SLO**: Service Level Objective
- **API**: Application Programming Interface
- **JWT**: JSON Web Token
- **CRUD**: Create, Read, Update, Delete

### B. References
- Solar Industry Standards (IEC 61724)
- OWASP Security Guidelines
- RESTful API Best Practices
- Cloud-Native Architecture

---

**Document Version**: 1.0  
**Status**: Approved  
**Next Review**: Q1 2026
