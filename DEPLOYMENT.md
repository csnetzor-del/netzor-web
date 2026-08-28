# NETZOR — Complete Deployment & Razorpay Setup Guide

This guide walks you through setting up your **PostgreSQL Backend (Render)**, deploying to **Vercel**, and connecting your **Razorpay API** for live/test payment collection.

---

## 1. Razorpay Account & API Keys Setup

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Switch to **Test Mode** (top toggle) while testing, or **Live Mode** when KYC is completed.
3. Go to **Account & Settings** → **API Keys** (under Developer Controls).
4. Click **Generate Key** (or Generate Test Key).
5. Copy your:
   - **Key ID** (e.g. `rzp_test_...` or `rzp_live_...`)
   - **Key Secret** (e.g. `xxxxxxxxxxxxxxxxxxxx`)
6. (Optional Webhook): Go to **Account & Settings** → **Webhooks** → **Add New Webhook**:
   - **Webhook URL:** `https://YOUR_VERCEL_OR_RENDER_URL/api/payments/webhook`
   - **Secret:** Enter a custom secret string (e.g. `netzor_wh_secret_2026`)
   - **Alert Email:** Your admin email
   - **Active Events:** Check `payment.captured`, `order.paid`, `payment.failed`
   - Click **Create Webhook** and copy the secret.

---

## 2. Setting Up Backend Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **PostgreSQL**.
3. Fill in details:
   - **Name:** `netzor-database`
   - **Database:** `netzor_db`
   - **User:** `netzor_user`
   - **Region:** Choose closest to your users (e.g., Singapore / Frankfurt)
   - **Plan:** Free or Starter
4. Click **Create Database**.
5. Once created, scroll to **Connections** and copy the **External Database URL** (e.g. `postgresql://netzor_user:password@dpg-xxxx.render.com/netzor_db?sslmode=require`).

---

## 3. Pushing Database Schema & Initial Seeds to Render DB

From your local machine or terminal:
```powershell
# Set your Render DATABASE_URL temporarily
$env:DATABASE_URL="postgresql://netzor_user:password@dpg-xxxx.render.com/netzor_db?sslmode=require"

# Push Prisma schema to Render PostgreSQL
npx prisma db push

# Seed initial admin, services, and demo accounts
npm run db:seed-all
```

---

## 4. Deploying to Vercel (Frontend & Serverless Backend)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** → **Project**.
2. Import your Git repository (`netzor-web`).
3. In the **Configure Project** screen, under **Environment Variables**, add the following:

| Variable Name | Value | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://...render.com/netzor_db?sslmode=require` | Render PostgreSQL database URL |
| `JWT_SECRET` | `long-random-string-at-least-32-characters` | Auth session token secret |
| `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` (or custom domain) | Base URL of your app |
| `NETZOR_PAY_PROVIDER` | `razorpay` | Payment gateway provider |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_test_...` (or `rzp_live_...`) | Razorpay public Key ID |
| `RAZORPAY_KEY_ID` | `rzp_test_...` (or `rzp_live_...`) | Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | `your_razorpay_secret` | Razorpay Secret Key |
| `RAZORPAY_WEBHOOK_SECRET` | `your_webhook_secret` | Razorpay Webhook Secret |

4. Click **Deploy**. Vercel will build the Next.js app and run `prisma generate` automatically.

---

## 5. Verification & Testing Payments

1. Open your live Vercel URL.
2. Sign in as demo client (`client@demo.io` / `Client@123`) or register a new client at `/auth/signup`.
3. For registration: Pay ₹500 via the Razorpay checkout modal.
4. For invoices: Go to **Dashboard → Billing** and click **Pay with Razorpay**.
5. In Razorpay Test Mode:
   - **Cards:** Any test card number (e.g. `4111 1111 1111 1111`, expiry in future, any CVV, OTP `123456`).
   - **UPI:** Enter `success@razorpay` or use mock QR/UPI apps.
   - **NetBanking:** Select any test bank (e.g., HDFC/SBI) and click **Success**.
6. The modal completes instantly, updates invoice status to `PAID`/`PARTIAL`, and displays the live transaction ID.
