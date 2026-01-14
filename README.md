# StudioGen AI

Professional Studio Image Generation Platform powered by Google Gemini AI.

## 🏗️ Project Structure

```
studiogen-ai/
├── .env                    # Environment variables (shared)
├── .env.example            # Environment template
├── package.json            # Root monorepo config
├── docker-compose.yml      # Docker orchestration
│
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── App.tsx         # Main application
│   │   └── main.tsx        # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                 # Node.js Backend (Express)
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── lib/            # Utilities
│   │   └── server.ts       # Entry point
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── package.json
│   └── tsconfig.json
│
└── shared/                 # Shared Types & Constants
    ├── types.ts
    ├── constants.ts
    └── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm or pnpm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd studiogen-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Setup database**
   ```bash
   npm run db:push
   ```

5. **Start development**
   ```bash
   # Start both client and server
   npm run dev

   # Or start separately
   npm run dev:client  # Frontend on http://localhost:5173
   npm run dev:server  # Backend on http://localhost:3001
   ```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both client and server |
| `npm run dev:client` | Start frontend only |
| `npm run dev:server` | Start backend only |
| `npm run build` | Build all packages |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Prisma Studio |

## 🔐 Security Features

- **JWT Authentication** with access/refresh token rotation
- **Rate Limiting** to prevent abuse
- **Helmet.js** security headers
- **bcrypt** password hashing (12 rounds)
- **Zod** request validation
- **Account lockout** after failed attempts
- **Audit logging** for sensitive operations

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/refresh` - Refresh tokens
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Image Generation
- `POST /api/generate/remove-bg` - Remove background
- `POST /api/generate/studio-image` - Generate studio image
- `POST /api/generate/unified-bg` - Generate unified background

### Health
- `GET /api/health` - Server health check

## 🐳 Docker Deployment

```bash
docker-compose up -d
```

## 📄 License

MIT License
