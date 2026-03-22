# Voerman Green Miles

B2B loyalty portal for Voerman international moving partners.

```
/               → React 18 + Vite frontend  (deploys to Vercel)
/api            → Node.js + Express backend  (deploys to Railway)
```

---

## Local Development

```bash
# 1. Clone
git clone https://github.com/YOUR_ORG/voerman.git
cd voerman

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd api && npm install && cd ..

# 4. Configure frontend env
cp .env.example .env.local
# Set: VITE_API_URL=http://localhost:3000

# 5. Configure backend env
cp api/.env.example api/.env
# Set: DATABASE_URL=postgresql://...

# 6. Run DB migrations + seed
cd api && npm run db:migrate:dev && npm run db:seed && cd ..

# 7. Start frontend (terminal 1)
npm run dev

# 8. Start backend (terminal 2)
cd api && npm run dev
```

Frontend → http://localhost:5173  
Backend  → http://localhost:3000  
Health   → http://localhost:3000/health

### Seed login credentials
| Email | Password | Role |
|-------|----------|------|
| john@acmemoving.com | Admin@123 | Admin |
| jane@acmemoving.com | Viewer@123 | Viewer |

---

## Deploy Frontend → Vercel

1. Import repo on [vercel.com](https://vercel.com)
2. **Root Directory** → leave as `/` (default)
3. Framework: **Vite** (auto-detected)
4. Add environment variable: `VITE_API_URL=https://your-api.railway.app`
5. Deploy

---

## Deploy Backend → Railway

1. New project on [railway.app](https://railway.app)
2. Add **PostgreSQL** service
3. Add **GitHub repo** service
4. In the service settings set **Root Directory → `api`**
5. Add environment variables:
   ```
   JWT_SECRET=<openssl rand -hex 32>
   JWT_REFRESH_SECRET=<openssl rand -hex 32>
   FRONTEND_URL=https://your-app.vercel.app
   NODE_ENV=production
   ```
   `DATABASE_URL` is auto-injected when you link the Postgres service.
6. Deploy — Railway runs migrations automatically on startup.

---

## Stack

| | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite, React Router v6, CSS Modules |
| Backend | Node.js 20, Express 4, TypeScript |
| ORM | Prisma 5 |
| Database | PostgreSQL 15 |
| Auth | JWT (1h access + 30d refresh) |
| Reports | ExcelJS + PDFKit |
