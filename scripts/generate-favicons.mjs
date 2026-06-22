import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(process.cwd());
const INPUT = path.join(ROOT, "assets", "brand-logo.png");

const publicDir = path.join(ROOT, "public");
const appDir = path.join(ROOT, "src", "app");

const outputs = [
  { filename: "favicon-16x16.png", size: 16 },
  { filename: "favicon-32x32.png", size: 32 },
  { filename: "favicon-48x48.png", size: 48 },
  { filename: "apple-touch-icon.png", size: 180 },
  { filename: "android-chrome-192x192.png", size: 192 },
  { filename: "android-chrome-512x512.png", size: 512 },
  { filename: "logo-icon.png", size: 320 },
  { filename: "logo.png", size: 512 },
];

/** Make near-black pixels transparent so the shield works on any background. */
async function loadTransparentLogo() {
  const { data, info } = await sharp(INPUT, { failOn: "none" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const threshold = 42;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r <= threshold && g <= threshold && b <= threshold) {
      data[i + 3] = 0;
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png();
}

async function writeIcon(pipeline, size, dest) {
  await pipeline
    .clone()
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(dest);
}

async function main() {
  await fs.mkdir(publicDir, { recursive: true });
  await fs.mkdir(appDir, { recursive: true });

  const logo = await loadTransparentLogo();

  for (const o of outputs) {
    await writeIcon(logo, o.size, path.join(publicDir, o.filename));
  }

  await fs.copyFile(
    path.join(publicDir, "android-chrome-512x512.png"),
    path.join(publicDir, "favicon.png")
  );

  await writeIcon(logo, 48, path.join(appDir, "icon.png"));
  await writeIcon(logo, 180, path.join(appDir, "apple-icon.png"));

  await fs.copyFile(
    path.join(publicDir, "favicon-32x32.png"),
    path.join(publicDir, "favicon.ico")
  );

  await fs.writeFile(
    path.join(publicDir, "site.webmanifest"),
    JSON.stringify(
      {
        name: "NETZOR",
        short_name: "NETZOR",
        icons: [
          { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
        ],
        theme_color: "#007fff",
        background_color: "#f4f9ff",
        display: "standalone",
      },
      null,
      2
    )
  );

  console.log("Brand logo, favicons, and transparent PNGs generated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
