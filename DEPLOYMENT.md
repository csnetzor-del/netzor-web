# NETZOR — Live deployment (Razorpay + Render + Netlify)

This app is **Next.js full-stack** (pages + API in one repo).  
**Render** runs the app + database (backend).  
**Netlify** can point your domain to Render, or host a duplicate Next.js build.

---

## Step 1 — Razorpay account & test keys

1. Go to [https://dashboard.razorpay.com](https://dashboard.razorpay.com) and sign up.
2. Complete business KYC when ready for live payments (test mode works immediately).
3. **Settings → API Keys** → Generate **Test** keys.
4. Copy:
   - **Key ID** (`rzp_test_...`)
   - **Key Secret**
5. **Settings → Webhooks** → Add endpoint (after Render deploy):
   - URL: `https://YOUR-RENDER-URL.onrender.com/api/payments/webhook`
   - Events: `payment.captured`
   - Copy **Webhook Secret**

**Done when:** You have Key ID, Key Secret, and (after deploy) webhook URL noted.

---

## Step 2 — Push code to GitHub

**Already done on your PC:** Git installed, repo initialized, first commit on `main` (99 files).

### 2a — Create empty GitHub repository

1. Open [https://github.com/new](https://github.com/new)
2. Repository name: `netzor-web` (or any name)
3. **Private** recommended
4. Do **not** add README, .gitignore, or license (repo must stay empty)
5. Click **Create repository**
6. Copy the HTTPS URL, e.g. `https://github.com/YOUR_USERNAME/netzor-web.git`

### 2b — Log in to GitHub (one time)

In PowerShell:

```powershell
gh auth login
```

Choose: GitHub.com → HTTPS → Login with browser → authorize.

### 2c — Push your code

```powershell
cd "d:\Projects\Netzor - Web"
.\scripts\step2-github-push.ps1 -RepoUrl "https://github.com/YOUR_USERNAME/netzor-web.git"
```

Or manually:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/netzor-web.git
git push -u origin main
```

**Done when:** GitHub shows your files and latest commit on `main`.

---

## Step 3 — Render (database + backend)

1. [https://dashboard.render.com](https://dashboard.render.com) → **New +** → **PostgreSQL** → name `netzor-db` → Create.
2. Copy **Internal Database URL**.
3. **New +** → **Web Service** → connect GitHub repo.
4. Settings:
   - **Build Command:** `npm install && npx prisma generate && npx prisma db push && npm run db:seed-all && npm run build`
   - **Start Command:** `npx next start -H 0.0.0.0 -p $PORT` (not `npm start -p $PORT`)
   - **Instance:** Free or paid
5. **Environment variables:**

| Key | Value |
|-----|--------|
| `DATABASE_URL` | PostgreSQL URL from step 1 |
| `JWT_SECRET` | long random string |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.onrender.com` |
| `NETZOR_PAY_PROVIDER` | `razorpay` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_test_...` |
| `RAZORPAY_KEY_ID` | same |
| `RAZORPAY_KEY_SECRET` | secret |
| `RAZORPAY_WEBHOOK_SECRET` | webhook secret |
| `NODE_ENV` | `production` |

6. Deploy → open URL → run seed once in **Shell**:
   `npm run db:seed && npm run db:seed-services`

7. Update Razorpay webhook URL to your live Render URL.

---

## Step 4 — Netlify (frontend / domain)

**Option A (recommended):** Use Netlify only for **custom domain** DNS → CNAME to Render URL.

**Option B:** Deploy same repo on Netlify with Next.js plugin:
- Build: `npm run build`
- Publish: `.next` (use `@netlify/plugin-nextjs`)
- Same env vars as Render
- Set `NEXT_PUBLIC_APP_URL` to Netlify URL

Because API routes need a server, **Option A** avoids running two backends.

---

## Step 5 — Test payment

1. Sign in as `client@demo.io` / `Client@123` (after seed).
2. **Dashboard → Billing → Pay with Netzor Pay**
3. Razorpay test card: `4111 1111 1111 1111`, any future expiry, any CVV.
4. UPI test mode available in Razorpay test dashboard.

---

## Local dev

```env
NETZOR_PAY_PROVIDER=simulated
```

Use `NETZOR_PAY_PROVIDER=razorpay` + test keys to test Razorpay locally.
