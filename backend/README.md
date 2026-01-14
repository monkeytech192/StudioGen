# StudioGen AI Backend

Secure backend API for StudioGen AI - Professional product photography generation.

## 🔒 Security Features

- **JWT Authentication** with access/refresh token rotation
- **Bcrypt** password hashing (12 rounds)
- **Rate Limiting** (general, auth, generation endpoints)
- **Helmet.js** security headers
- **Input Validation** with Zod schemas
- **CORS** protection
- **Audit Logging** for security monitoring
- **Account Lockout** after failed login attempts
- **Secure Cookie** settings

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- npm or pnpm

### Installation

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Setup environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Setup database:**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations (production)
npm run db:migrate
```

4. **Start development server:**
```bash
npm run dev
```

## 📁 Project Structure

```
backend/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── config/
│   │   └── index.ts        # Environment configuration
│   ├── lib/
│   │   └── prisma.ts       # Prisma client singleton
│   ├── middleware/
│   │   ├── auth.ts         # JWT authentication
│   │   ├── audit.ts        # Audit logging
│   │   ├── error.ts        # Error handling
│   │   ├── rateLimit.ts    # Rate limiting
│   │   └── validate.ts     # Input validation
│   ├── routes/
│   │   ├── auth.ts         # Authentication endpoints
│   │   ├── generate.ts     # AI generation endpoints
│   │   ├── health.ts       # Health checks
│   │   └── projects.ts     # Project CRUD
│   ├── schemas/
│   │   └── index.ts        # Zod validation schemas
│   └── server.ts           # Express app entry
├── .env.example
├── Dockerfile
├── package.json
└── tsconfig.json
```

## 🔑 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login with credentials |
| POST | `/api/auth/google` | Login with Google |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout (invalidate token) |
| GET | `/api/auth/me` | Get current user |
| PATCH | `/api/auth/me` | Update profile |
| POST | `/api/auth/change-password` | Change password |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project |
| PATCH | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/projects/:id/images` | Add image |
| DELETE | `/api/projects/:id/images/:imageId` | Delete image |

### Generation (AI)

| Method | Endpoint | Credits | Description |
|--------|----------|---------|-------------|
| POST | `/api/generate/remove-background` | 5 | Remove image background |
| POST | `/api/generate/studio-image` | 10-20 | Generate studio image |
| POST | `/api/generate/unified-background` | 15 | Generate brand background |
| POST | `/api/generate/suggest-colors` | 0 | Suggest text colors |
| GET | `/api/generate/credits` | 0 | Get credit balance |

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f backend
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | PostgreSQL connection string | ✅ |
| JWT_ACCESS_SECRET | Secret for access tokens (32+ chars) | ✅ |
| JWT_REFRESH_SECRET | Secret for refresh tokens (32+ chars) | ✅ |
| GEMINI_API_KEY | Google Gemini API key | ✅ |
| GOOGLE_CLIENT_ID | Google OAuth client ID | ❌ |
| FRONTEND_URL | Frontend URL for CORS | ❌ |
| PORT | Server port (default: 3001) | ❌ |

## 🔐 Security Best Practices

1. **Generate strong secrets:**
```bash
# Generate JWT secrets
openssl rand -base64 64
```

2. **Use HTTPS in production**

3. **Set secure cookie settings:**
```
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict
```

4. **Keep dependencies updated:**
```bash
npm audit
npm update
```

## 📄 License

MIT
