# Move NETZOR off Render → Vercel + Neon (free)

Render suspended **netzor-web** and **netzor-db**. Use this path instead:

| Service | Role | Free tier |
|---------|------|-----------|
| **Vercel** | Runs Next.js (site + API) | Hobby (free) |
| **Neon** | PostgreSQL database | Free (0.5 GB) |
| **Hostinger** | Domain `netzor.in` DNS only | (you already have) |

Repo: `https://github.com/csnetzor-del/netzor-web` branch `main`

---

## Part 1 — Neon database (free)

1. Open [https://neon.tech](https://neon.tech) → sign up (GitHub is fine).
2. **New project** → name: `netzor` → region: **Singapore** or closest to India.
3. Copy the **connection string** (PostgreSQL).
4. Use the **pooled** URL (hostname contains `-pooler`) and add SSL if missing:
   ```
   postgresql://USER:PASS@ep-xxxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
5. Save this as `DATABASE_URL` — you will paste it into Vercel.

### Create tables + demo data (one time, from your PC)

In PowerShell, in the project folder:

```powershell
cd "D:\Projects\Netzor - Web"
$env:DATABASE_URL="postgresql://YOUR_NEON_POOLED_URL"
npm run db:push
npm run db:seed-all
```

**Note:** If Render DB is suspended, old client data may be lost unless you exported it earlier. Seeding recreates admin/staff/demo client accounts.

---

## Part 2 — Vercel app (free)

1. Open [https://vercel.com](https://vercel.com) → sign up with **GitHub**.
2. **Add New → Project** → import **`csnetzor-del/netzor-web`**.
3. Framework: **Next.js** (auto-detected).

### Build settings

| Setting | Value |
|---------|--------|
| **Build Command** | `npm run build:vercel` |
| **Output Directory** | (leave default) |
| **Install Command** | `npm install` |

### Environment variables (Vercel → Settings → Environment Variables)

Add these for **Production**:

| Key | Value |
|-----|--------|
| `DATABASE_URL` | Neon pooled connection string |
| `JWT_SECRET` | Long random string (32+ chars) |
| `NEXT_PUBLIC_APP_URL` | `https://www.netzor.in` |
| `NETZOR_PAY_PROVIDER` | `razorpay` |
| `NETZOR_PAY_MERCHANT_ID` | `NZR-PROD` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Your Razorpay key |
| `RAZORPAY_KEY_ID` | Same as above |
| `RAZORPAY_KEY_SECRET` | From Razorpay dashboard |
| `RAZORPAY_WEBHOOK_SECRET` | From Razorpay webhook |
| `NEXT_PUBLIC_WHATSAPP_URL` | Your WhatsApp link (optional) |

4. Click **Deploy** and wait until **Ready**.
5. Open the `*.vercel.app` URL Vercel gives you — confirm the homepage loads and sign-in works.

---

## Part 3 — Connect netzor.in (Hostinger DNS)

In **Hostinger** → **Domains** → **netzor.in** → **DNS**:

1. Remove old **Render** records if any (A `@` → `216.24.57.1`, CNAME `www` → `onrender.com`).
2. In **Vercel** → project → **Settings → Domains** → add:
   - `www.netzor.in`
   - `netzor.in`
3. Vercel shows DNS records — add them in Hostinger:

| Type | Name | Value |
|------|------|--------|
| **CNAME** | `www` | `cname.vercel-dns.com` (use exact value from Vercel) |
| **A** | `@` | `76.76.21.21` (Vercel apex — use exact value from Vercel) |

4. Wait 15–60 minutes for DNS + SSL.
5. Confirm `https://www.netzor.in` opens the Vercel deployment.

---

## Part 4 — Razorpay webhook

Razorpay → **Settings → Webhooks** → update endpoint to:

```
https://www.netzor.in/api/payments/webhook
```

---

## Part 5 — Google Search Console (after site is live)

1. **Settings → robots.txt → Request recrawl**
2. **URL Inspection** → `https://www.netzor.in/` → **Test live URL** → **Request indexing**

---

## Demo logins (after seed)

| Role | Email | Password |
|------|--------|----------|
| Admin | `admin@netzor.io` | `Admin@123` |
| Client | `client@demo.io` | `Client@123` |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails on Prisma | Ensure `DATABASE_URL` is set in Vercel **before** deploy |
| Login works on `vercel.app` but not `netzor.in` | Set `NEXT_PUBLIC_APP_URL=https://www.netzor.in` and redeploy |
| Database connection errors | Use Neon **pooled** URL with `?sslmode=require` |
| Site slow first visit | Neon/Vercel free tiers wake from sleep — normal |
| Old Render URLs in DNS | Remove Render A/CNAME records in Hostinger |

---

## What to do with Render

You can leave suspended services or delete them in Render dashboard — they are no longer needed after Vercel + Neon works.
