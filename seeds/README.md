# Apolaki Solar Platform — Data Seeding Utility

Standalone utility to populate the PostgreSQL database with realistic demo data for development, testing, and demos. **Completely independent** of the middleware, frontend, and backend code.

## Quick Start

```bash
cd seeds
npm install
cp .env.example .env   # then edit with your DB credentials
npm run seed            # seed everything
npm run seed:verify     # confirm it worked
```

## Commands

| Command | Description |
| ------- | ----------- |
| `npm run seed` | Seed all tables in dependency order |
| `npm run seed:fresh` | Teardown all seeded data, then re-seed from scratch |
| `npm run seed:users` | Seed only the `users` table |
| `npm run seed:installations` | Seed only `solar_installations` (auto-seeds users) |
| `npm run seed:monitoring` | Seed only `monitoring_data` (auto-seeds users + installations) |
| `npm run seed:performance` | Seed only `performance_data` (auto-seeds users + installations) |
| `npm run seed:marketplace` | Seed only `marketplace_products` (no dependencies) |
| `npm run seed:contracts` | Seed only `contracts` (auto-seeds users) |
| `npm run seed:assessments` | Seed only `assessments` (auto-seeds users) |
| `npm run seed:finance` | Seed only `finance` (auto-seeds users) |
| `npm run seed:verify` | Verify seed data by printing row counts per table |
| `npm run teardown` | Remove all seeded data (interactive confirmation) |
| `npm run teardown:confirm` | Remove all seeded data (no confirmation prompt) |

## Architecture

```text
seeds/
├── package.json          # Standalone — no dependency on middleware or frontend
├── .env.example          # Database connection template
├── .gitignore            # Keeps node_modules and .env out of git
├── README.md             # This file
└── src/
    ├── index.js          # CLI entry point — orchestrates seeding
    ├── teardown.js       # Removes seeded data (reverse FK order)
    ├── verify.js         # Verifies seed data integrity
    ├── db.js             # Database connection (pg Pool only)
    ├── logger.js         # Structured console logger with colour output
    └── seeders/
        ├── 01-users.js           # 5 demo users with hashed passwords
        ├── 02-installations.js   # 6 solar installations (PH locations)
        ├── 03-monitoring.js      # 7 days × 5-min intervals of monitoring data
        ├── 04-performance.js     # 30 days of daily performance aggregates
        ├── 05-marketplace.js     # 12 marketplace products (panels, inverters, batteries)
        ├── 06-contracts.js       # 5 contracts (PPA, lease, warranty)
        ├── 07-assessments.js     # 7 solar site assessments
        ├── 08-finance.js         # 10 financial transactions (PHP currency)
        └── 09-maintenance.js     # 10 maintenance log entries
```

Each seeder is a self-contained ES module exporting `{ name, seed, teardown }`. They are executed in numeric order to respect foreign-key dependencies.

## Seeded Data Overview

| Table | Records | Description |
| ----- | ------- | ----------- |
| `users` | 5 | Admin, homeowner, installer, trader, viewer — with bcrypt passwords |
| `solar_installations` | 6 | Philippine cities: Makati, Cebu, Davao, QC, Batangas, Iloilo |
| `monitoring_data` | ~12,000+ | 5-minute interval time-series with realistic solar curves |
| `performance_data` | 180 | 30-day daily aggregates per installation |
| `marketplace_products` | 12 | Panels, inverters, batteries, chargers, kits |
| `contracts` | 5 | PPA, lease, maintenance, warranty agreements |
| `assessments` | 7 | Site assessments with savings estimates |
| `finance` | 10 | Payments, credits, refunds in PHP |
| `maintenance_log` | 10 | Routine, emergency, repair, cleaning, upgrade |

## Safety Features

- **Production guard** — refuses to run against any `DATABASE_URL` containing `prod` unless `--force` is passed.
- **Idempotent** — uses `ON CONFLICT DO NOTHING`; running `npm run seed` twice does not create duplicates.
- **Deterministic** — fixed UUIDs for cross-seeder references; seeded PRNG for time-series data.
- **Reversible** — `npm run teardown` removes only seeded rows (by their fixed UUIDs) — never drops tables or touches non-seeded data.

## Demo Credentials

| Email | Password | Role |
| ----- | -------- | ---- |
| `admin@apolaki.solar` | `Admin@12345!` | admin |
| `homeowner@apolaki.solar` | `Solar@Home1!` | customer |
| `installer@apolaki.solar` | `Install@Sun1!` | installer |
| `trader@apolaki.solar` | `Trade@Energy1!` | customer |
| `viewer@apolaki.solar` | `ViewOnly@1!` | customer |

## Environment Variables

| Variable | Required | Default | Description |
| -------- | -------- | ------- | ----------- |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `SEED_BCRYPT_ROUNDS` | No | `10` | bcrypt cost factor for demo passwords (lower = faster) |
