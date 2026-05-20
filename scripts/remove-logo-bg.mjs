/**
 * Removes dark background from logo → transparent PNG (icon only).
 */
import sharp from "sharp";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const input = join(root, "public", "logo.png");
const output = join(root, "public", "logo-icon.png");

function isBackground(r, g, b, a) {
  if (a < 10) return true;
  const brightness = (r + g + b) / 3;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;

  // Very dark pixels (navy/black gradient)
  if (brightness < 38) return true;
  // Dark desaturated blues in outer glow
  if (brightness < 72 && saturation < 0.35 && b > r) return true;
  // Faint wireframe on dark — only remove if very dim
  if (brightness < 55 && max < 90) return true;

  return false;
}

const image = sharp(input).ensureAlpha();
const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * channels;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (isBackground(r, g, b, a)) {
      data[i + 3] = 0;
    } else if (isBackground(r * 0.9, g * 0.9, b * 0.9, a)) {
      // Soft edge feather
      data[i + 3] = Math.min(a, 120);
    }
  }
}

await sharp(data, { raw: { width, height, channels } })
  .png()
  .trim({ threshold: 10 })
  .toFile(output);

const iconApp = join(root, "src", "app", "icon.png");
await sharp(output).resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(iconApp);

console.log("Wrote", output);
