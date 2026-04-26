# Contributing to Apolaki

Thank you for your interest in contributing to Apolaki! We welcome contributions from everyone.

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions.

## How to Contribute

### 1. Report Bugs
- Use GitHub Issues to report bugs
- Include steps to reproduce
- Provide expected vs actual behavior

### 2. Suggest Features
- Create a GitHub Issue with [FEATURE] prefix
- Describe the use case and benefit
- Discuss design before implementation

### 3. Submit Code

#### Development Setup
```bash
git clone <repo-url>
cd apolaki-updated-app
```

#### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

#### Middleware Development
```bash
cd middleware/solar-service
go mod download
go run cmd/main.go
```

#### Creating a Pull Request
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes following code style guidelines
3. Add tests for new functionality
4. Update documentation as needed
5. Commit with clear messages: `git commit -m "feat: add your feature"`
6. Push to your fork: `git push origin feature/your-feature`
7. Create a Pull Request with description of changes

## Code Style

### TypeScript/Vue
- Use TypeScript for type safety
- Follow ESLint configuration
- Format with Prettier
- Use Composition API for Vue components

### Go
- Follow `gofmt` formatting
- Run `go vet ./...` before submitting
- Use meaningful variable names
- Write tests for all functions
- Add comments for exported functions

## Testing

### Frontend Tests
```bash
npm run test
npm run test:ui
```

### Go Tests
```bash
go test ./...
go test -v ./...
go test -cover ./...
```

### Integration Tests
```bash
docker-compose -f config/docker-compose.yml up -d
go test -tags=integration ./...
```

## Documentation

- Update README.md for structural changes
- Add comments to complex logic
- Update API documentation (OpenAPI/Swagger)
- Document new features in appropriate PRD

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (no logic changes)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Build, dependencies, tools

Example:
```
feat(monitoring): add real-time WebSocket updates

- Implement WebSocket server for real-time data
- Add client reconnection logic
- Update dashboard to use real-time updates

Closes #123
```

## Review Process

1. At least 2 approvals required
2. All tests must pass
3. Code coverage must not decrease
4. Documentation must be complete

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

- Create a GitHub Discussion
- Email: team@apolaki.com
- Join our Slack community

---

Thank you for contributing to Apolaki! 🌞
