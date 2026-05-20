/** Public site URL — Render sets RENDER_EXTERNAL_URL automatically */
export function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    "http://localhost:3000"
  );
}
