# ☀️ Apolaki Solar Platform

> Enterprise-grade solar energy management — monitoring, trading, analytics, and marketplace.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js 18+](https://img.shields.io/badge/Node.js-18%2B-brightgreen)](https://nodejs.org/)
[![Go 1.21+](https://img.shields.io/badge/Go-1.21%2B-brightgreen)](https://golang.org/)
[![Docker Ready](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)

---

## Quick Start

```bash
git clone <repository-url>
cd apolaki-updated-app

# Frontend
cd frontend && npm install && npm run dev   # http://localhost:5173

# Backend (in a second terminal)
cd middleware/netlify-db-service && npm install && npm start   # http://localhost:3000
```

Full setup details → [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md)

---

## Documentation

**📖 Start here:** [`DOCUMENTATION.md`](DOCUMENTATION.md) — Complete system reference (single source of truth)

### Quick Links by Role

**🚀 Deploying?** → See [DOCUMENTATION.md § Deployment Architecture](DOCUMENTATION.md#deployment-architecture)

**💻 Developing?** → See [DOCUMENTATION.md § Development Setup](DOCUMENTATION.md#development-setup)

**🔐 Setting up authentication?** → See [DOCUMENTATION.md § Authentication](DOCUMENTATION.md#authentication)

**📊 Need monitoring/logging?** → See [DOCUMENTATION.md § Logging & Monitoring](DOCUMENTATION.md#logging--monitoring)

**❓ Troubleshooting?** → See [DOCUMENTATION.md § Troubleshooting](DOCUMENTATION.md#troubleshooting)

### Additional References

| Document | For |
|----------|-----|
| [AGENTS.md](AGENTS.md) | Code standards, SOLID principles, OWASP security |
| [CONSTITUTION.md](CONSTITUTION.md) | Governance, values, decision-making |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute code |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Deep-dive system design |
| [docs/API_REFERENCE.md](docs/API_REFERENCE.md) | Detailed API endpoints |
| [docs/COMPONENTS.md](docs/COMPONENTS.md) | Vue.js components library |
| [docs/OAUTH_SETUP_GUIDE.md](docs/OAUTH_SETUP_GUIDE.md) | OAuth provider setup (step-by-step) |
| [docs/CI_CD_PIPELINE.md](docs/CI_CD_PIPELINE.md) | GitHub Actions workflows |
| [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) | Detailed production deployment |
| [docs/MONITORING_LOGGING.md](docs/MONITORING_LOGGING.md) | Observability setup |
| [docs/MVP.PRD.md](docs/MVP.PRD.md) | Product requirements |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue.js 3, Vite, Pinia, Tailwind CSS |
| Backend | Node.js 18 + Express (DB service), Go 1.21+ (Solar service) |
| Database | PostgreSQL 15+ |
| Auth | Passport.js — Google, Facebook, Instagram, Viber, Telegram |
| Infra | Docker, Kubernetes, Helm, GitHub Actions |

---

## Project Structure

```text
├── frontend/               Vue.js 3 SPA
│   └── src/
│       ├── components/     Button, Card, Badge, Modal, Alert, OAuthLogin
│       ├── views/          Dashboard, pages
│       ├── stores/         Pinia state
│       ├── services/       API clients
│       └── router/         Vue Router
│
├── middleware/
│   ├── netlify-db-service/ Node.js API + PostgreSQL
│   └── solar-service/      Go microservice
│
├── config/                 docker-compose, env files, init-db.sql
├── scripts/                deploy-prod.sh, dev-setup-local.sh, utilities
├── helm/                   Kubernetes Helm charts (frontend, db-service, solar-service)
├── .github/workflows/      CI/CD pipelines
├── docs/                   ← All documentation lives here
├── README.md               ← You are here
└── CONTRIBUTING.md         Contribution guidelines
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branch conventions, commit format, code style, and PR process.

---

## License

[MIT](LICENSE)
