/** Public site URL — use www.netzor.in as canonical in production */
export function getAppUrl() {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    "http://localhost:3000";

  try {
    const url = new URL(raw);
    if (url.hostname === "netzor.in") {
      url.hostname = "www.netzor.in";
    }
    return url.origin;
  } catch {
    return raw.replace(/\/$/, "");
  }
}
