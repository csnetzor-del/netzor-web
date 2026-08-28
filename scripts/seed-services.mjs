import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const { servicesCatalog } = await import("../src/lib/services-catalog.ts");

for (const s of servicesCatalog) {
  await prisma.service.upsert({
    where: { slug: s.slug },
    update: {
      title: s.title,
      description: s.description,
      shortDesc: s.shortDesc,
      emoji: s.emoji,
      icon: s.icon,
      category: s.category,
      features: JSON.stringify(s.features),
      sortOrder: s.sortOrder,
      isActive: true,
    },
    create: {
      title: s.title,
      slug: s.slug,
      description: s.description,
      shortDesc: s.shortDesc,
      emoji: s.emoji,
      icon: s.icon,
      category: s.category,
      features: JSON.stringify(s.features),
      sortOrder: s.sortOrder,
      isActive: true,
    },
  });
}

await prisma.service.updateMany({
  where: { slug: { notIn: servicesCatalog.map((s) => s.slug) } },
  data: { isActive: false },
});

console.log(`Seeded ${servicesCatalog.length} services.`);
await prisma.$disconnect();
