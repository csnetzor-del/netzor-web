# Step 4 — Connect netzor.in (Netlify) to Render

Your app runs **entirely on Render** (pages + login API). Netlify does **not** need a second Next.js build or a separate API connection.

Choose **one** option below.

---

## Option A — Recommended: DNS only (domain on Netlify → app on Render)

Use Netlify for **DNS / domain management** only. Traffic goes straight to Render.

### A1 — Add domain on Render

1. [Render Dashboard](https://dashboard.render.com) → **netzor-web** → **Settings** → **Custom Domains**.
2. Add:
   - `www.netzor.in`
   - `netzor.in` (apex)
3. Render shows DNS records to create (copy them).

### A2 — Add DNS records in Netlify

1. [Netlify](https://app.netlify.com) → **Domains** → **netzor.in** → **DNS settings** (or **Manage DNS**).
2. Add the records Render gave you. Typical setup:

| Type  | Name | Value |
|-------|------|--------|
| CNAME | `www` | `your-service.onrender.com` (from Render) |
| ALIAS or ANAME | `@` | same Render hostname (if Netlify supports ALIAS for apex) |

If Netlify cannot ALIAS the apex (`@`), use Render’s apex instructions (often **A records** to Render IPs) or redirect apex → www in Netlify:

| Type | Name | Value |
|------|------|--------|
| URL redirect / forward | `@` | `https://www.netzor.in` |

3. Wait for DNS + SSL (up to 24–48 hours; often minutes).

### A3 — Environment on Render

Set (then **Manual Deploy**):

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_APP_URL` | `https://www.netzor.in` (or `https://netzor.in` — pick one canonical URL and stick to it) |

### A4 — Razorpay webhook

Update webhook URL to your **public** domain:

`https://www.netzor.in/api/payments/webhook`

(or `https://netzor.in/...` if you use apex as canonical)

### A5 — Netlify site (if you had one)

If a Netlify site was also building this repo, you can **disable auto-publish** or delete that site so you are not running two copies. Only DNS for `netzor.in` is needed.

**Done when:** `https://www.netzor.in` opens the site and login works.

---

## Option B — Netlify proxies all traffic to Render

Use this if you must keep an active **Netlify site** on `netzor.in` but still want Render to run the app.

1. Set env var on Netlify (Site settings → Environment):  
   `RENDER_APP_URL` = `https://your-service.onrender.com` (no trailing slash)
2. Use the repo’s `netlify.toml` proxy config (see file — `NETLIFY_PROXY_TO_RENDER=true` flow in comments).
3. On Render, set `NEXT_PUBLIC_APP_URL` = `https://www.netzor.in` (your Netlify custom domain).
4. Deploy both: Render (main app) + Netlify (proxy-only).

**Note:** Option A is simpler and faster (one hop, one SSL cert on Render).

---

## What you do NOT need

| Myth | Reality |
|------|---------|
| Netlify frontend + Render API via REST | Not used — Next.js API routes live on Render |
| Connect Render “via API key” to Netlify | No API link; only DNS or proxy |
| Deploy full Next on both | Avoid duplicate backends (Option A) |

---

## Test after connecting

1. Open `https://www.netzor.in/auth/signin`
2. `client@demo.io` / `Client@123`
3. Dashboard loads

If login works on `*.onrender.com` but not on `netzor.in`, check `NEXT_PUBLIC_APP_URL` matches the domain in the browser bar exactly.

---

## Quick checklist

- [ ] Render service **Live**
- [ ] Custom domain verified on Render
- [ ] DNS records in Netlify DNS
- [ ] `NEXT_PUBLIC_APP_URL` = your live domain
- [ ] Razorpay webhook uses same domain
- [ ] Build on Render includes `npm run db:seed-all`
