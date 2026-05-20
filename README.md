# Netzor — IT Company Website & Client Portal

Professional marketing site with secure client portal, **Netzor Pay** checkout (coupon support), and full admin console.

## Features

- **Public site:** Home, services, about, contact
- **Auth:** Client signup/signin, JWT session cookies
- **Client dashboard:** Projects, billing/installments, Netzor Pay, support tickets, profile
- **Admin panel:** Client registration & password generation, projects, payments, coupons, services, tickets, staff roles, analytics

## Quick start

```bash
npm install
cp .env.example .env
# Set DATABASE_URL to PostgreSQL (Neon/Render free DB or local Postgres)
npm run db:push
npm run db:seed
npm run db:seed-services
npm run dev
```

**Live deploy:** see [DEPLOYMENT.md](./DEPLOYMENT.md)

Open [http://localhost:3000](http://localhost:3000)

### Demo accounts

| Role   | Email             | Password   |
|--------|-------------------|------------|
| Admin  | admin@netzor.io   | Admin@123  |
| Staff  | staff@netzor.io   | Staff@123  |
| Client | client@demo.io    | Client@123 |

### Demo coupons

- `WELCOME10` — 10% off (min $100)
- `LAUNCH500` — $500 off (min $5000)

## Netzor Pay

Built-in payment channel (simulated for development). Configure in `.env`:

- `NETZOR_PAY_MERCHANT_ID`
- `NETZOR_PAY_API_KEY`

For production, replace `src/lib/payment-gateway.ts` with Stripe or your PSP while keeping the coupon and installment logic.

## Tech stack

- Next.js 15 (App Router)
- Prisma + SQLite
- Tailwind CSS 4
- Recharts (admin analytics)
