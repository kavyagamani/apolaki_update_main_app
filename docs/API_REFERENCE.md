# Apolaki API Reference & Quick Start

**Last Updated**: February 26, 2026

## Authentication

### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "token": "jwt_token",
  "refreshToken": "refresh_token"
}
```

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response (200):**
```json
{
  "token": "jwt_token",
  "refreshToken": "refresh_token",
  "expiresIn": 86400
}
```

## Installations

### List Installations
```http
GET /api/v1/installations
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Home Solar System",
      "location": {
        "latitude": 40.7128,
        "longitude": -74.0060
      },
      "systemSize": 8.5,
      "panelCount": 25,
      "installationDate": "2024-01-15T00:00:00Z",
      "status": "active"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### Get Installation Details
```http
GET /api/v1/installations/{id}
Authorization: Bearer {token}
```

### Create Installation
```http
POST /api/v1/installations
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Home Solar System",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Main St, NY, USA"
  },
  "systemSize": 8.5,
  "panelType": "monocrystalline",
  "panelCount": 25,
  "inverterModel": "SolarEdge SE10000H",
  "installationDate": "2024-01-15"
}
```

## Monitoring

### Current Data
```http
GET /api/v1/installations/{id}/current
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "timestamp": "2026-02-26T10:30:00Z",
  "powerOutput": 5.2,
  "energyToday": 18.5,
  "systemEfficiency": 94.2,
  "temperature": 22.5,
  "weather": {
    "condition": "Sunny",
    "cloudCover": 5,
    "windSpeed": 8.5
  },
  "lastUpdate": "2026-02-26T10:30:00Z"
}
```

### Daily Data
```http
GET /api/v1/installations/{id}/daily?date=2026-02-26
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "data": [
    {
      "hour": 0,
      "energyProduced": 0.2,
      "powerAverage": 0.1
    },
    {
      "hour": 1,
      "energyProduced": 0.3,
      "powerAverage": 0.15
    }
    // ... 22 more hours
  ],
  "summary": {
    "totalEnergy": 18.5,
    "averagePower": 0.77,
    "peakPower": 8.2,
    "estimated_savings": "$4.25"
  }
}
```

### Real-Time Updates (WebSocket)
```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:8080/ws/installations/{id}');

// Receive real-time updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Power:', data.powerOutput, 'kW');
  console.log('Energy Today:', data.energyToday, 'kWh');
};

// Keep connection alive with ping
setInterval(() => {
  ws.send(JSON.stringify({ type: 'ping' }));
}, 30000);
```

## Marketplace

### List Products
```http
GET /api/v1/marketplace/products?category=panels&sort=rating&limit=20
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "prod_123",
      "name": "SunPower SPR-E20-435",
      "type": "panel",
      "manufacturer": "SunPower",
      "specs": {
        "power": 435,
        "efficiency": 22.8,
        "warranty": 25
      },
      "price": 1200,
      "rating": 4.8,
      "reviews": 127,
      "inStock": true
    }
  ],
  "pagination": {
    "total": 2456,
    "page": 1,
    "limit": 20
  }
}
```

### Get Product Details
```http
GET /api/v1/marketplace/products/{id}
Authorization: Bearer {token}
```

### List Providers
```http
GET /api/v1/marketplace/providers?location=New+York&certification=NABCEP
Authorization: Bearer {token}
```

## Financial Assessment

### Calculate ROI
```http
POST /api/v1/assessment/calculate
Authorization: Bearer {token}
Content-Type: application/json

{
  "installationId": "uuid",
  "systemCost": 25000,
  "installationCost": 5000,
  "annualEnergyProduction": 12000,
  "utilityRate": 0.14,
  "financingOption": "cash"
}
```

**Response (200):**
```json
{
  "id": "assessment_123",
  "roi": 6.8,
  "paybackPeriod": 8.2,
  "twentyYearSavings": 45320,
  "annualSavings": 1680,
  "breakeven": {
    "year": 8,
    "month": 2
  },
  "financing": {
    "loanAmount": 30000,
    "monthlyPayment": 485,
    "interestRate": 6.5,
    "term": 84
  },
  "taxIncentives": {
    "federalTax": 7500,
    "stateTax": 2500
  }
}
```

## Contracts

### List Contracts
```http
GET /api/v1/contracts?status=pending&type=purchase
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "contract_123",
      "title": "Solar Installation Agreement",
      "provider": "SolarCo Inc",
      "status": "pending",
      "createdAt": "2026-02-20T00:00:00Z",
      "expiresAt": "2026-03-20T00:00:00Z",
      "signatories": [
        {
          "email": "user@example.com",
          "status": "pending"
        },
        {
          "email": "provider@solarco.com",
          "status": "signed"
        }
      ]
    }
  ]
}
```

### Sign Contract
```http
POST /api/v1/contracts/{id}/sign
Authorization: Bearer {token}
Content-Type: application/json

{
  "signature": "base64_encoded_signature",
  "timestamp": "2026-02-26T10:30:00Z"
}
```

**Response (200):**
```json
{
  "id": "contract_123",
  "status": "signed",
  "signedAt": "2026-02-26T10:30:00Z",
  "downloadUrl": "https://api.apolaki.com/contracts/123/download"
}
```

## User Profile

### Get Profile
```http
GET /api/v1/users/profile
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "avatar": "https://...",
  "location": {
    "city": "New York",
    "state": "NY",
    "country": "USA"
  },
  "settings": {
    "notifications": true,
    "language": "en",
    "timezone": "America/New_York"
  },
  "createdAt": "2025-06-15T00:00:00Z"
}
```

### Update Profile
```http
PUT /api/v1/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "settings": {
    "notifications": true,
    "language": "en"
  }
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "User not found",
    "details": {
      "field": "email",
      "reason": "Email does not exist"
    }
  }
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Too Many Requests |
| 500 | Server Error |

## Rate Limiting

All authenticated endpoints have rate limits:

```
- Free tier: 1,000 requests/hour
- Pro tier: 10,000 requests/hour
- Enterprise: Unlimited
```

Response headers indicate rate limit status:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1645804800
```

## Pagination

List endpoints support pagination:

```http
GET /api/v1/installations?page=1&limit=20&sort=name&order=asc
```

**Response includes:**
```json
{
  "data": [ /* ... */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "pages": 8,
    "hasMore": true,
    "nextPage": 2,
    "prevPage": null
  }
}
```

## Frontend Integration

### Using Axios
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1'
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fetch installations
const response = await api.get('/installations');
console.log(response.data);
```

### Using Vue Composable
```typescript
// composables/useSolar.ts
export const useSolar = () => {
  const installations = ref([]);
  const loading = ref(false);

  const fetchInstallations = async () => {
    loading.value = true;
    try {
      const response = await api.get('/installations');
      installations.value = response.data.data;
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    fetchInstallations();
  });

  return {
    installations,
    loading,
    fetchInstallations
  };
};
```

---

**API Version**: v1  
**Base URL**: `https://api.apolaki.com` (Production) | `http://localhost:8080` (Development)
