# Apolaki Solar Platform - Netlify DB Service

A modern, serverless API service for the Apolaki Solar Platform using **Netlify Neon** (PostgreSQL) database and Node.js/Express.

## 🚀 Features

- **Netlify Neon Database** - Serverless PostgreSQL with zero configuration
- **SQL Query Builder** - Using `@netlify/neon` for safe, parameterized queries
- **RESTful API** - Complete REST API for all solar platform operations
- **Real-time Data** - Monitor solar installations in real-time
- **Performance Analytics** - Track and analyze system performance
- **Contract Management** - Service contracts and agreements
- **Financial Tracking** - Transaction history and summaries
- **Marketplace** - Product and service catalog
- **Scalable** - Production-ready with proper error handling

## 📋 Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 🔧 Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Netlify account with Neon database

### Steps

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your database URL
# NETLIFY_DATABASE_URL=postgresql://...

# Start development server
npm run dev

# Or start production server
npm start
```

## ⚙️ Configuration

### Environment Variables

```env
# Database Connection (provided by Netlify Neon)
NETLIFY_DATABASE_URL=postgresql://user:password@host:5432/apolaki_solar

# Server
PORT=3001
NODE_ENV=development

# API
API_BASE_URL=http://localhost:3001
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Database Setup

The database schema is in `schema.sql`. Run it to create all tables:

```bash
psql $NETLIFY_DATABASE_URL < schema.sql
```

## 💡 Usage Examples

### Creating a User

```javascript
import { users } from './src/db.js';

const newUser = await users.create({
  email: 'user@example.com',
  passwordHash: 'hashed_password',
  firstName: 'John',
  lastName: 'Doe',
  role: 'customer'
});

console.log(newUser.id); // UUID of created user
```

### Recording Solar Installation Data

```javascript
import { solarInstallations, monitoringData } from './src/db.js';

// Create an installation
const installation = await solarInstallations.create({
  userId: 'user-uuid',
  name: 'Home Solar System',
  address: '123 Main St',
  capacity: 5.0,
  panelCount: 13,
  inverterType: 'SMA Sunny Boy'
});

// Record monitoring data
const data = await monitoringData.create({
  installationId: installation.id,
  powerOutput: 4500,
  voltageAc: 240,
  currentAc: 18.75,
  temperature: 32.5,
  efficiency: 94.8,
  status: 'normal'
});
```

### Querying with Neon SQL

```javascript
import { sql } from './src/db.js';

// Get recent monitoring data
const [latestReading] = await sql`
  SELECT * FROM monitoring_data 
  WHERE installation_id = ${installationId}
  ORDER BY timestamp DESC
  LIMIT 1
`;

// Get all installations for a user
const installations = await sql`
  SELECT * FROM solar_installations
  WHERE user_id = ${userId}
  ORDER BY created_at DESC
`;

// Aggregate performance data
const stats = await sql`
  SELECT 
    DATE(date) as day,
    SUM(energy_generated) as total_energy,
    AVG(avg_efficiency) as avg_efficiency
  FROM performance_data
  WHERE installation_id = ${installationId}
  GROUP BY DATE(date)
  ORDER BY day DESC
  LIMIT 7
`;
```

## 🔌 API Endpoints

### Users
```
POST   /api/users              Create user
GET    /api/users              List all users
GET    /api/users/:id          Get user by ID
PUT    /api/users/:id          Update user
```

### Solar Installations
```
POST   /api/installations                    Create installation
GET    /api/installations/:id                Get installation
GET    /api/users/:userId/installations      List user's installations
PUT    /api/installations/:id                Update installation
```

### Monitoring (Real-time Data)
```
POST   /api/installations/:id/monitoring     Record monitoring data
GET    /api/installations/:id/monitoring     Get monitoring data
```

### Performance (Analytics)
```
POST   /api/installations/:id/performance    Record performance data
GET    /api/installations/:id/performance    Get performance metrics
```

### Maintenance
```
POST   /api/installations/:id/maintenance    Create maintenance log
GET    /api/installations/:id/maintenance    Get maintenance logs
```

### Contracts
```
POST   /api/contracts                        Create contract
GET    /api/users/:userId/contracts          List user contracts
```

### Assessments
```
POST   /api/assessments                      Create assessment
GET    /api/assessments/:id                  Get assessment
GET    /api/users/:userId/assessments        List user assessments
```

### Marketplace
```
GET    /api/marketplace/products             List products
GET    /api/marketplace/products/:id         Get product
GET    /api/marketplace/products/category/:cat  Get by category
```

### Finance
```
POST   /api/finance/transactions             Create transaction
GET    /api/users/:userId/finance/transactions  List transactions
GET    /api/users/:userId/finance/summary    Get summary
```

## 📊 Database Schema

### Core Tables

- **users** - User accounts and profiles
- **solar_installations** - Solar system installations
- **contracts** - Service contracts
- **assessments** - Solar assessments

### Data Tables

- **monitoring_data** - Real-time system readings
- **performance_data** - Daily performance aggregates
- **maintenance_log** - Service and maintenance records
- **finance** - Financial transactions

### Utility Tables

- **marketplace_products** - Products and services catalog

All tables include:
- UUID primary keys
- Automatic timestamps
- Foreign key relationships
- Performance indexes

## 📦 Deployment

### To Netlify

1. Push code to GitHub
2. Connect repository to Netlify
3. Set environment variables in Netlify dashboard:
   - `NETLIFY_DATABASE_URL` (from Neon)
   - `NODE_ENV=production`
4. Deploy automatically on push

### Using Netlify Neon

1. Go to Netlify Dashboard
2. Select site → Integrations → Neon
3. Click "Connect" to create database
4. Copy connection string to `NETLIFY_DATABASE_URL`

## 🔍 Example Requests

### Create User
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "passwordHash": "hash",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Record Monitoring Data
```bash
curl -X POST http://localhost:3001/api/installations/{id}/monitoring \
  -H "Content-Type: application/json" \
  -d '{
    "powerOutput": 5000,
    "voltageAc": 240,
    "currentAc": 20.8,
    "temperature": 35,
    "efficiency": 95.5,
    "status": "normal"
  }'
```

### Query User Installations
```bash
curl http://localhost:3001/api/users/{userId}/installations
```

## 📁 Project Structure

```
netlify-db-service/
├── src/
│   ├── server.js        # Express server setup
│   ├── db.js            # Database operations
│   └── routes.js        # API route handlers
├── schema.sql           # Database schema
├── package.json         # Dependencies
├── .env.example         # Environment template
├── SETUP.md             # Setup guide
└── README.md            # This file
```

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check environment variable
echo $NETLIFY_DATABASE_URL

# Test connection
psql $NETLIFY_DATABASE_URL -c "SELECT 1"
```

### Tables Not Found
```bash
# Recreate schema
psql $NETLIFY_DATABASE_URL < schema.sql
```

### Port Already in Use
```bash
# Use different port
PORT=3002 npm run dev
```

## 📚 Additional Resources

- [Netlify Neon Documentation](https://docs.netlify.com/datastore/overview/)
- [@netlify/neon Package](https://www.npmjs.com/package/@netlify/neon)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [Apolaki Documentation](../../docs/)

## 📝 License

MIT

## 🤝 Support

For issues or questions, refer to:
1. `SETUP.md` for detailed setup instructions
2. `schema.sql` for database structure
3. `src/routes.js` for API endpoint definitions
4. `src/db.js` for database operation examples

---

**Status:** ✅ Production Ready  
**Last Updated:** February 26, 2024  
**Version:** 1.0.0
