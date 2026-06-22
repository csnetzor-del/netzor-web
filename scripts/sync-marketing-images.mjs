import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(process.cwd());
const ASSETS =
  process.env.MARKETING_ASSETS ??
  path.join(
    process.env.USERPROFILE ?? "",
    ".cursor",
    "projects",
    "d-Projects-Netzor-Web",
    "assets"
  );
const OUT = path.join(ROOT, "public", "marketing");

const files = [
  "hero-portal.png",
  "hero-ai.png",
  "hero-consulting.png",
  "services-bg.png",
  "software-delivery.png",
  "cloud-security.png",
  "portal-cta.png",
  "about.png",
  "contact.png",
  "contact-stats.png",
  "contact-form.png",
  "cybersecurity.png",
  "managed-it-services.png",
  "network-support.png",
  "digital-transformation.png",
  "software-development.png",
  "internet-of-things.png",
  "hardware-installation.png",
  "technical-support.png",
  "data-backup-recovery.png",
  "qa-testing.png",
];

await fs.mkdir(OUT, { recursive: true });

for (const file of files) {
  const src = path.join(ASSETS, file);
  const webp = path.join(OUT, file.replace(/\.png$/, ".webp"));

  await sharp(src)
    .resize(1920, 1080, { fit: "cover", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(webp);

  console.log(`Synced ${file} -> marketing/${path.basename(webp)}`);
}

console.log("All marketing images synced to public/marketing/");
