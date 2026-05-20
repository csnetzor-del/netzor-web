# Step 3 — Deploy on Render (NETZOR)

Repo: **https://github.com/csnetzor-del/netzor-web**

---

## Option A — Blueprint (fastest)

1. Go to [https://dashboard.render.com](https://dashboard.render.com) → sign in with GitHub.
2. **New +** → **Blueprint**.
3. Connect repo **csnetzor-del/netzor-web**.
4. Render reads `render.yaml` and creates **netzor-db** + **netzor-web**.
5. When prompted, fill **sync: false** variables:
   - `NEXT_PUBLIC_APP_URL` → leave empty first deploy, then set to `https://netzor-web.onrender.com` (your real URL) and redeploy.
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID` / `RAZORPAY_KEY_ID` → your `rzp_test_...`
   - `RAZORPAY_KEY_SECRET` → test secret
   - `RAZORPAY_WEBHOOK_SECRET` → from Razorpay (after webhook step below)
   - `NEXT_PUBLIC_WHATSAPP_URL` → optional
6. Click **Apply** and wait for deploy (~5–10 min).

---

## Option B — Manual (step by step)

### 3.1 — PostgreSQL database

1. **New +** → **PostgreSQL**.
2. Name: `netzor-db`.
3. Plan: **Free**.
4. **Create Database**.
5. Copy **Internal Database URL** (starts with `postgresql://`).

### 3.2 — Web service

1. **New +** → **Web Service**.
2. Connect **csnetzor-del/netzor-web** → branch **main**.
3. Settings:

| Field | Value |
|--------|--------|
| Name | `netzor-web` |
| Runtime | Node |
| Build Command | `npm install && npx prisma generate && npx prisma db push && npm run build` |
| Start Command | `npx next start -H 0.0.0.0 -p $PORT` |

> **Important:** Never use `npm start -p $PORT`. On npm, `-p` means `--prefix`, so Render passes `10000` as a folder and Next.js crashes.

4. **Environment** → Add variables:

| Key | Value |
|-----|--------|
| `DATABASE_URL` | Internal Database URL from 3.1 |
| `JWT_SECRET` | Click Generate (or paste 32+ random characters) |
| `NODE_ENV` | `production` |
| `NETZOR_PAY_PROVIDER` | `razorpay` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_test_xxxxx` |
| `RAZORPAY_KEY_ID` | same as above |
| `RAZORPAY_KEY_SECRET` | your Razorpay test secret |
| `RAZORPAY_WEBHOOK_SECRET` | from Razorpay webhook (step 3.5) |
| `NEXT_PUBLIC_APP_URL` | `https://netzor-web.onrender.com` (use your actual URL after first deploy) |

5. **Create Web Service** → wait until status is **Live**.

### 3.3 — Seed database (demo users + services)

**Free Render (no Shell):** Demo data is seeded automatically during each deploy. The build command includes `npm run db:seed-all` after `prisma db push`. You should see `Seed complete.` in the **build** logs.

**Optional — seed from your PC** (if you skipped the updated build command):

1. Render → **netzor-db** → copy **External Database URL**.
2. In PowerShell on your PC:

```powershell
cd "d:\Projects\Netzor - Web"
$env:DATABASE_URL="postgresql://..."   # paste External URL
npm run db:seed-all
```

**Paid Render with Shell:** You can still run `npm run db:seed-all` in the Shell tab.

### 3.4 — Set public URL (if not set)

1. Copy your live URL from the top of the dashboard (e.g. `https://netzor-web-xxxx.onrender.com`).
2. **Environment** → set `NEXT_PUBLIC_APP_URL` to that URL exactly (no trailing slash).
3. **Manual Deploy** → Deploy latest commit.

### 3.5 — Razorpay webhook

1. [Razorpay Dashboard](https://dashboard.razorpay.com) → **Settings → Webhooks**.
2. **Add New Webhook**:
   - URL: `https://YOUR-RENDER-URL.onrender.com/api/payments/webhook`
   - Event: **payment.captured**
3. Save and copy **Webhook Secret** → add to Render as `RAZORPAY_WEBHOOK_SECRET`.
4. Redeploy on Render.

---

## Test live site

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@netzor.io | Admin@123 |
| Client | client@demo.io | Client@123 |

1. Open your Render URL.
2. Sign in as client → **Dashboard → Billing → Pay with Netzor Pay**.
3. Test card: `4111 1111 1111 1111`, any future expiry/CVV.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `no such directory: .../10000` on deploy | **Settings → Start Command** must be `npx next start -H 0.0.0.0 -p $PORT` (not `npm start -p $PORT`) |
| Build fails on Prisma | Check `DATABASE_URL` is set before build |
| 502 on first visit | Free tier waking up — wait 30s and refresh |
| Login fails | Redeploy (build runs seed) or run `npm run db:seed-all` locally with External `DATABASE_URL` |
| Payment fails | Check Razorpay keys and `NETZOR_PAY_PROVIDER=razorpay` |
| Webhook not firing | URL must be HTTPS Render URL + redeploy after adding secret |

---

**Step 3 done when:** Site loads, login works, and test payment completes.

Next: **Step 4 — Netlify** (custom domain pointing to Render).
