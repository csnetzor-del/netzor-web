# netzor.in — Hostinger domain + Netlify site + Render app

Your setup:

```
Hostinger (domain)  →  DNS  →  Netlify (site already live)  →  should show  →  Render (NETZOR app)
```

You **do not** connect Netlify to Render with an API key. You either **proxy** traffic on Netlify to Render, or **move DNS** from Netlify to Render.

---

## Path 1 — Keep Netlify site (recommended for you)

**Keep Hostinger DNS pointing to Netlify** (no DNS change at Hostinger). Change the Netlify site so it **forwards/proxies** every page to your Render URL.

### Step 1 — Confirm Render is Live

Open your Render URL, e.g. `https://netzor-web-xxxx.onrender.com` — homepage and sign-in must work there first.

### Step 2 — Point your Netlify site at this GitHub repo (proxy deploy)

1. [Netlify](https://app.netlify.com) → open your **existing** site for netzor.in.
2. **Site configuration** → **Build & deploy** → **Link repository** (or **Change repository**).
3. Connect **`csnetzor-del/netzor-web`**, branch **`main`**.
4. Build settings (Netlify reads `netlify.toml` from repo):

   | Setting | Value |
   |---------|--------|
   | Build command | (from `netlify.toml`) |
   | Publish directory | `public` |

5. **Stop Netlify auto-detecting Next.js** (even when Build plugins is empty):

   **Recommended — use subfolder `netlify-proxy`:**
   - **Site configuration** → **Build & deploy** → **Build settings** → **Edit settings**
   - **Base directory:** `netlify-proxy`
   - **Build command:** leave **empty** (or delete override)
   - **Publish directory:** leave **empty** (uses `netlify-proxy/netlify.toml` → `public`)
   - **Framework preset:** **Other** or **None** (not Next.js)

   **Also add environment variable** (Site → Environment variables):
   - Key: `NETLIFY_NEXT_PLUGIN_SKIP` → Value: `true`

6. Confirm redirect target is your real Render URL in `netlify-proxy/netlify.toml`.

7. **Deploy site** — build log should **not** say `Using Next.js Runtime`.

### Step 3 — Edit proxy target (one-time)

In `netlify.toml`, uncomment the `[[redirects]]` block and replace `YOUR-SERVICE` with your Render hostname:

```toml
[[redirects]]
  from = "/*"
  to = "https://netzor-web-xxxx.onrender.com/:splat"
  status = 200
  force = true
```

`status = 200` = **proxy** (browser stays on `netzor.in`; Render serves the app).

Or add in the Netlify UI → **Redirects** → Rule:

| From | To | Status |
|------|-----|--------|
| `/*` | `https://YOUR-RENDER-URL.onrender.com/:splat` | **200** (Rewrite) |

### Step 4 — Custom domain on Netlify (already done)

**Domain management** → `netzor.in` / `www.netzor.in` should stay attached to this site. No change at Hostinger if DNS already points to Netlify.

Typical Hostinger DNS (unchanged):

| Type | Name | Points to |
|------|------|-----------|
| A or CNAME | `@` / `www` | Netlify (as Netlify docs show) |

### Step 5 — Render environment

Render → **Environment**:

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_APP_URL` | `https://netzor.in` or `https://www.netzor.in` — **exactly** what users type in the browser |

**Manual Deploy** on Render.

### Step 6 — Razorpay

Webhook URL:

`https://netzor.in/api/payments/webhook`

(use `www` if that is your main URL)

### Step 7 — Test

1. `https://netzor.in` — should show NETZOR from Render (via proxy).
2. `https://netzor.in/auth/signin` — `client@demo.io` / `Client@123`.

---

## Path 2 — Skip Netlify hosting (DNS at Hostinger → Render)

Use this if you want to **turn off** the Netlify deploy and host only on Render.

1. Render → **Custom Domains** → add `netzor.in` and `www.netzor.in`.
2. **Hostinger** → **DNS** → replace Netlify records with Render’s CNAME/A records.
3. Set `NEXT_PUBLIC_APP_URL` on Render to your domain.
4. Netlify site can stay but domain no longer points there.

---

## If your Netlify site is a different project (old HTML site)

You have two choices:

| Choice | Action |
|--------|--------|
| **A** | Switch Netlify site to repo `netzor-web` + proxy `netlify.toml` (Path 1) |
| **B** | In the **old** repo, add only `_redirects`: `/* https://YOUR.onrender.com/:splat 200` and redeploy |

Do **not** run a full Next.js build on Netlify **and** on Render for the same domain — one backend (Render) is enough.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| netzor.in shows old Netlify page | Clear cache; confirm latest deploy; redirect must be **200** not 301 |
| Login works on `.onrender.com` but not on netzor.in | `NEXT_PUBLIC_APP_URL` must match `netzor.in` or `www.netzor.in` |
| Too Many Redirects | Do not proxy Render URL back to Netlify; proxy only on Netlify → Render |
| `does not contain expected Next.js build output` | Set **Base directory** to `netlify-proxy`; Framework **None**; env `NETLIFY_NEXT_PLUGIN_SKIP=true` |
| Build log says `Using Next.js Runtime` | Netlify auto-detected Next from root `package.json` — use **Base directory: netlify-proxy** |
| Two redirect rules in deploy log | Delete extra rule in Netlify **Redirects** (keep one `200` to Render) |
| 404 on Netlify | Publish dir must be `public`; redirect rule must be active |

---

## Summary

| Piece | Role |
|-------|------|
| **Hostinger** | You bought the domain; DNS usually points to Netlify |
| **Netlify** | Custom domain + **proxy** to Render (Path 1) |
| **Render** | Real app, database, login, payments |
| **API link?** | None — proxy passes all requests to Render |
