import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(process.cwd());
const INPUT =
  "C:\\Users\\DELL\\.cursor\\projects\\d-Projects-Netzor-Web\\assets\\c__Users_DELL_AppData_Roaming_Cursor_User_workspaceStorage_c21b4139ef5131afdb72c14fcea75fc9_images_lodo-73da48ec-82b7-45bd-87e5-a03e2d99ebc9.png";

const publicDir = path.join(ROOT, "public");
const appDir = path.join(ROOT, "src", "app");

const outputs = [
  { filename: "favicon-16x16.png", size: 16 },
  { filename: "favicon-32x32.png", size: 32 },
  { filename: "favicon-48x48.png", size: 48 },
  { filename: "apple-touch-icon.png", size: 180 },
  { filename: "android-chrome-192x192.png", size: 192 },
  { filename: "android-chrome-512x512.png", size: 512 },
  { filename: "logo-icon.png", size: 256 },
];

/** Crop the shield emblem (top of logo), not the full image with text. */
function shieldCrop(meta) {
  const width = Math.floor(meta.width * 0.52);
  const height = Math.floor(meta.height * 0.58);
  return {
    left: Math.floor((meta.width - width) / 2),
    top: Math.floor(meta.height * 0.06),
    width,
    height,
  };
}

async function writeIcon(size, dest) {
  const meta = await sharp(INPUT, { failOn: "none" }).metadata();
  if (!meta.width || !meta.height) {
    throw new Error("Could not read input image metadata");
  }

  const crop = shieldCrop(meta);
  await sharp(INPUT, { failOn: "none" })
    .extract(crop)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(dest);
}

async function main() {
  await fs.mkdir(publicDir, { recursive: true });
  await fs.mkdir(appDir, { recursive: true });

  for (const o of outputs) {
    await writeIcon(o.size, path.join(publicDir, o.filename));
  }

  await fs.copyFile(
    path.join(publicDir, "android-chrome-512x512.png"),
    path.join(publicDir, "favicon.png")
  );

  // Next.js auto-discovers these for /favicon.ico and metadata.
  await writeIcon(48, path.join(appDir, "icon.png"));
  await writeIcon(180, path.join(appDir, "apple-icon.png"));

  // Many crawlers (including Google) still request /favicon.ico directly.
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
        theme_color: "#0a1628",
        background_color: "#0a1628",
        display: "standalone",
      },
      null,
      2
    )
  );

  console.log("Favicons + logo-icon regenerated from shield emblem.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
