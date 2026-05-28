import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(process.cwd());
const INPUT =
  "C:\\Users\\DELL\\.cursor\\projects\\d-Projects-Netzor-Web\\assets\\c__Users_DELL_AppData_Roaming_Cursor_User_workspaceStorage_c21b4139ef5131afdb72c14fcea75fc9_images_lodo-73da48ec-82b7-45bd-87e5-a03e2d99ebc9.png";

const outDir = path.join(ROOT, "public");

const outputs = [
  { filename: "favicon-16x16.png", size: 16 },
  { filename: "favicon-32x32.png", size: 32 },
  { filename: "favicon-48x48.png", size: 48 },
  { filename: "apple-touch-icon.png", size: 180 },
  { filename: "android-chrome-192x192.png", size: 192 },
  { filename: "android-chrome-512x512.png", size: 512 },
];

async function main() {
  await fs.mkdir(outDir, { recursive: true });

  const src = sharp(INPUT, { failOn: "none" }).ensureAlpha();
  const meta = await src.metadata();
  if (!meta.width || !meta.height) {
    throw new Error("Could not read input image metadata");
  }

  // Crop from center to a square (best for favicons).
  const side = Math.min(meta.width, meta.height);
  const left = Math.floor((meta.width - side) / 2);
  const top = Math.floor((meta.height - side) / 2);

  for (const o of outputs) {
    const dest = path.join(outDir, o.filename);
    await sharp(INPUT, { failOn: "none" })
      .extract({ left, top, width: side, height: side })
      .resize(o.size, o.size, { fit: "cover" })
      .png({ quality: 90 })
      .toFile(dest);
  }

  // Convenience: a default favicon.png (512) for easy linking.
  await fs.copyFile(
    path.join(outDir, "android-chrome-512x512.png"),
    path.join(outDir, "favicon.png")
  );

  console.log("Favicons generated in public/.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

