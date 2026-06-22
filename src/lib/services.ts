import { prisma } from "./prisma";
import {
  servicesCatalog,
  type ServiceCatalogItem,
  type ServiceCategory,
  parseServiceFeatures,
} from "./services-catalog";
import type { ServiceForDisplay } from "@/components/marketing/ServicesSection";

const catalogBySlug = Object.fromEntries(
  servicesCatalog.map((s) => [s.slug, s])
);

const coreSlugs = servicesCatalog
  .filter((s) => s.category === "core")
  .map((s) => s.slug);

const DB_QUERY_TIMEOUT_MS = 3000;

async function withDbTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("Database query timed out")), DB_QUERY_TIMEOUT_MS);
    }),
  ]);
}

function toDisplayService(
  row: Awaited<ReturnType<typeof prisma.service.findMany>>[number]
): ServiceForDisplay {
  const catalog = catalogBySlug[row.slug];
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    shortDesc: row.shortDesc,
    emoji: row.emoji ?? catalog?.emoji ?? null,
    icon: row.icon || catalog?.icon || "code",
    category: catalog?.category ?? row.category ?? "core",
    features:
      row.features && row.features !== "[]"
        ? row.features
        : JSON.stringify(catalog?.features ?? []),
    priceFrom: row.priceFrom,
  };
}

function catalogToDisplayService(item: ServiceCatalogItem): ServiceForDisplay {
  return {
    id: item.slug,
    title: item.title,
    slug: item.slug,
    description: item.description,
    shortDesc: item.shortDesc,
    emoji: item.emoji,
    icon: item.icon,
    category: item.category,
    features: JSON.stringify(item.features),
    priceFrom: null,
  };
}

/** Fetch services for public pages (works even if Prisma client lacks `category` field). */
export async function getPublicServices(
  filter: "all" | ServiceCategory = "all"
): Promise<ServiceForDisplay[]> {
  let services: ServiceForDisplay[];

  try {
    const rows = await withDbTimeout(
      prisma.service.findMany({
        where: {
          isActive: true,
          ...(filter === "core" ? { slug: { in: coreSlugs } } : {}),
        },
        orderBy: { sortOrder: "asc" },
      })
    );

    services = rows.map(toDisplayService);
  } catch {
    services = servicesCatalog
      .filter((service) => filter !== "core" || coreSlugs.includes(service.slug))
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(catalogToDisplayService);
  }

  if (filter === "advanced") {
    services = services.filter((s) => s.category === "advanced");
  }

  return services;
}

export { parseServiceFeatures };
