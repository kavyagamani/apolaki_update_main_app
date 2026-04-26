# Multi-stage build for Go Solar Service
# Stage 1: Build
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git ca-certificates

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application with optimizations
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags="-w -s" -o solar-service ./cmd/main.go

# Stage 2: Runtime
FROM alpine:latest

WORKDIR /root/

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates

# Copy binary from builder
COPY --from=builder /app/solar-service .

# Copy any required config files
COPY config/ ./config/

# Create a non-root user for security
RUN addgroup -g 1001 -S solr
RUN adduser -S solar -u 1001 -G solr

USER solar

# Expose port
EXPOSE 8080

# Environment variables
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

# Start the application
CMD ["./solar-service"]
