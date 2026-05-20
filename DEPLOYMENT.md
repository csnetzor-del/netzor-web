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

```bash
git init
git add .
git commit -m "NETZOR with Razorpay"
git branch -M main
git remote add origin https://github.com/YOUR_USER/netzor-web.git
git push -u origin main
```

---

## Step 3 — Render (database + backend)

1. [https://dashboard.render.com](https://dashboard.render.com) → **New +** → **PostgreSQL** → name `netzor-db` → Create.
2. Copy **Internal Database URL**.
3. **New +** → **Web Service** → connect GitHub repo.
4. Settings:
   - **Build Command:** `npm install && npx prisma db push && npm run build`
   - **Start Command:** `npm start`
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
