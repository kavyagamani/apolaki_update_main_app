# Solar Service

Go-based microservice for solar installation monitoring, marketplace management, contract handling, and financial assessments.

## Getting Started

### Prerequisites
- Go 1.21+
- PostgreSQL 15+
- Redis

### Development

```bash
# Install dependencies
go mod download

# Run service
go run cmd/main.go

# Run tests
go test ./...

# Build
go build -o solar-service cmd/main.go
```

## Project Structure

```
solar-service/
├── cmd/
│   └── main.go                 # Application entry point
├── internal/
│   ├── domain/                 # Domain models
│   ├── handlers/               # HTTP/gRPC handlers
│   ├── services/               # Business logic
│   ├── repositories/           # Data access
│   └── middleware/             # HTTP middleware
├── api/
│   ├── proto/                  # Protocol Buffer definitions
│   └── openapi.yaml            # API documentation
├── tests/
│   ├── unit/
│   └── integration/
├── go.mod
├── go.sum
└── Dockerfile
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh`

### Installations
- `GET /api/v1/installations`
- `POST /api/v1/installations`
- `GET /api/v1/installations/{id}`
- `PUT /api/v1/installations/{id}`
- `DELETE /api/v1/installations/{id}`

### Monitoring
- `GET /api/v1/installations/{id}/current`
- `GET /api/v1/installations/{id}/daily`
- `GET /api/v1/installations/{id}/monthly`

### More endpoints documented in OpenAPI spec

## Environment Variables

See `.env.dev` in the config directory for all available environment variables.

## Health Checks

- `/health` - Service health status
- `/ready` - Readiness check

## Docker

```bash
docker build -t apolaki/solar-service .
docker run -p 8080:8080 apolaki/solar-service
```

---

**Apolaki Solar Service** - Part of the Apolaki Platform
