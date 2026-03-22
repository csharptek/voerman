# Voerman Green Miles — Partner Portal

A production-ready React/Vite partner portal for the Voerman Green Miles loyalty program.

## Tech Stack

- **React 18** + **TypeScript**
- **Vite 6** (build tool)
- **React Router v6** (client-side routing)
- **CSS Modules** (component-scoped styling)
- **Lucide React** (icons)

## Screens

| Route | Screen |
|-------|--------|
| `/login` | Login |
| `/register` | Partner Registration |
| `/register/success` | Registration Submitted |
| `/dashboard` | Dashboard (KPIs, Tier Progress, Recent Moves) |
| `/moves` | Move History (searchable full table) |
| `/moves/:id` | Move History Details |
| `/redeem` | Redeem Rewards (catalog) |
| `/redeem/confirm` | Confirm Redemption |
| `/tier-benefits` | Tier Benefits (Bronze → Platinum) |
| `/group-codes` | Group Codes |
| `/reports` | Reports & Analytics |
| `/settings` | Settings (Account / Security / Notifications / Users) |
| `/admin` | Admin Panel (Partners, Moves, Approvals) |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo at [vercel.com](https://vercel.com) — it auto-detects Vite.

## Deploy to Railway

1. Push to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Railway auto-uses `railway.toml` — no config needed

## Connect a Backend

The app uses `src/context/AuthContext.tsx` for auth and `src/data/mockData.ts` for all data.

To wire up a real backend:

1. **Auth** — replace `login()` in `AuthContext.tsx` with a `fetch('/api/auth/login', ...)` call
2. **Data** — replace imports from `mockData.ts` with API calls in each page component
3. **Environment** — create `.env.local`:

```env
VITE_API_URL=https://your-api.railway.app
```

Then use `import.meta.env.VITE_API_URL` in your fetch calls.

## Project Structure

```
src/
├── components/
│   └── ui/               # Shared UI components + CSS module
├── context/
│   └── AuthContext.tsx   # Auth state (replace with real API)
├── data/
│   └── mockData.ts       # All mock data (replace with API calls)
├── layouts/
│   ├── AuthLayout.tsx    # Centered auth page wrapper
│   └── DashboardLayout.tsx  # Sidebar + topbar layout
├── pages/
│   ├── auth/             # Login, Register, Success
│   └── dashboard/        # All 10 dashboard screens
├── styles/
│   └── globals.css       # Design tokens + resets
└── App.tsx               # Router + route definitions
```

## Design System

All design tokens extracted from Figma file `k7LT2s5OterwlqR7R2EBW3`:

- **Primary:** `#171630` (Navy)
- **Accent:** `#41ab35` (Green)
- **Background:** `#f8f9fb`
- **Border:** `1.275px solid #e2e8f0`
- **Border radius:** `8px` (inputs), `12px` (cards)
- **Font:** Segoe UI
