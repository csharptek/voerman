# Voerman Green Miles — API

Node.js / Express / Prisma / PostgreSQL backend for the Green Miles B2B loyalty portal.

## Stack
- **Runtime:** Node.js 20 + TypeScript
- **Framework:** Express 4
- **ORM:** Prisma 5 (PostgreSQL)
- **Auth:** JWT (access 1h + refresh 30d)
- **Reports:** ExcelJS + PDFKit

---

## Quick Start (local)

```bash
# 1. Install
npm install

# 2. Set up env
cp .env.example .env
# Edit .env — set DATABASE_URL to your local postgres

# 3. Run migrations + seed
npm run db:migrate:dev
npm run db:seed

# 4. Start dev server
npm run dev
```

### Default seed credentials
| Email | Password | Role |
|-------|----------|------|
| john@acmemoving.com | Admin@123 | ADMIN |
| jane@acmemoving.com | Viewer@123 | VIEWER |

---

## Deploy on Railway

### Step 1 — Create services
1. New project on [railway.app](https://railway.app)
2. Add **PostgreSQL** service
3. Add **GitHub repo** service (this repo)

### Step 2 — Set environment variables
In the API service, add:
```
JWT_SECRET=<random 64-char string>
JWT_REFRESH_SECRET=<random 64-char string>
FRONTEND_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
```
`DATABASE_URL` is injected automatically by Railway when you link the Postgres service.

### Step 3 — Deploy
Push to GitHub → Railway auto-deploys.

The `railway.toml` handles:
- `npm install && prisma generate && tsc`  (build)
- `prisma migrate deploy && node dist/index.js`  (start)

---

## API Reference

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new company + admin user |
| POST | `/api/auth/login` | Login, returns JWT tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Invalidate refresh token |
| GET  | `/api/auth/me` | Current user profile |

### Moves
| Method | Path | Description |
|--------|------|-------------|
| GET  | `/api/moves` | Paginated move list |
| GET  | `/api/moves/:id` | Move detail + timeline |
| POST | `/api/moves` | Create move (admin) |
| PATCH | `/api/moves/:id/status` | Update invoice/claims status |

### Points
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/points/balance` | Balance + tier info |
| GET | `/api/points/ledger` | Transaction history |
| GET | `/api/points/expiring` | Expiring points |

### Rewards & Redemptions
| Method | Path | Description |
|--------|------|-------------|
| GET  | `/api/rewards` | Catalog with can-afford annotation |
| POST | `/api/redemptions` | Redeem a reward → voucher code |
| GET  | `/api/redemptions/history` | Redemption history |
| GET  | `/api/redemptions/:id` | Voucher detail |

### Reports
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/reports/yearly?year=2026&format=pdf` | Yearly report |
| GET | `/api/reports/quarterly?year=2026&quarter=1&format=excel` | Quarterly |
| GET | `/api/reports/points-statement?year=2026&month=2&format=pdf` | Tax statement |
| GET | `/api/reports/redemptions?year=2026&format=excel` | Redemptions |
| GET | `/api/reports/analytics` | 12-month trend data |

### Admin (ADMIN role required)
| Method | Path | Description |
|--------|------|-------------|
| GET   | `/api/admin/dashboard` | System-wide stats |
| GET   | `/api/admin/partners` | All companies |
| POST  | `/api/admin/moves` | Add booking + calculate points |
| GET   | `/api/admin/moves` | All moves |
| PATCH | `/api/admin/moves/:id/approve` | Confirm points |
| PATCH | `/api/admin/points/adjust` | Manual adjustment |

---

## Points Logic
- **Rate:** €10 = 1 point (based on eligible revenue)
- **Eligible revenue** = Total invoice − Excluded amounts (storage, 3rd party)
- **Points credited** only when: invoice paid AND no major claims
- **Tier recalculated** monthly based on rolling 12-month earned points

| Tier | Threshold | Expiry |
|------|-----------|--------|
| Bronze | 0 pts | 12 months |
| Silver | 5,000 pts | 15 months |
| Gold | 15,000 pts | 18 months |
| Platinum | 25,000 pts | 24 months |
