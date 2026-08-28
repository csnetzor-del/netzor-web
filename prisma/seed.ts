import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin@123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@netzor.io" },
    update: {},
    create: {
      email: "admin@netzor.io",
      passwordHash,
      name: "System Administrator",
      role: Role.ADMIN,
    },
  });

  const staffHash = await bcrypt.hash("Staff@123", 12);
  const staffUser = await prisma.user.upsert({
    where: { email: "staff@netzor.io" },
    update: {},
    create: {
      email: "staff@netzor.io",
      passwordHash: staffHash,
      name: "Sarah Mitchell",
      role: Role.STAFF,
      staffProfile: {
        create: {
          department: "Delivery",
          permissions: JSON.stringify([
            "clients.view",
            "projects.edit",
            "tickets.manage",
          ]),
        },
      },
    },
  });

  const clientHash = await bcrypt.hash("Client@123", 12);
  const clientUser = await prisma.user.upsert({
    where: { email: "client@demo.io" },
    update: {},
    create: {
      email: "client@demo.io",
      passwordHash: clientHash,
      name: "Alex Rivera",
      role: Role.CLIENT,
      clientProfile: {
        create: {
          companyName: "Rivera Digital Ltd",
          phone: "+1 555 0100",
          address: "120 Innovation Park, Suite 4",
          clientCode: "NZR-CL-1001",
        },
      },
    },
  });

  const clientProfile = await prisma.clientProfile.findUnique({
    where: { userId: clientUser.id },
  });

  if (clientProfile) {
    const demoProjectTitle = "E-Commerce Platform Redesign";
    let project = await prisma.project.findFirst({
      where: { clientId: clientProfile.id, title: demoProjectTitle },
    });
    if (!project) {
      project = await prisma.project.create({
      data: {
        clientId: clientProfile.id,
        title: demoProjectTitle,
        description: "Full-stack rebuild with modern UX and payment integration.",
        status: "IN_PROGRESS",
        progress: 62,
        startDate: new Date("2025-01-15"),
        dueDate: new Date("2026-06-30"),
        updates: {
          create: [
            {
              title: "Sprint 4 complete",
              message: "Checkout flow and admin catalog modules deployed to staging.",
            },
            {
              title: "Design sign-off",
              message: "Client approved final UI kit and component library.",
            },
          ],
        },
        documents: {
          create: [
            {
              name: "Project Charter.pdf",
              fileUrl: "/documents/sample-charter.pdf",
              fileType: "pdf",
            },
            {
              name: "Sprint 4 Report.pdf",
              fileUrl: "/documents/sample-sprint-report.pdf",
              fileType: "pdf",
            },
          ],
        },
      },
    });
    }

    await prisma.invoice.upsert({
      where: { invoiceNo: "INV-2025-0042" },
      update: {},
      create: {
        clientId: clientProfile.id,
        invoiceNo: "INV-2025-0042",
        title: "Platform Redesign — Phase 2",
        totalAmount: 24000,
        paidAmount: 8000,
        status: "PARTIAL",
        dueDate: new Date("2026-08-15"),
        installments: {
          create: [
            {
              label: "Milestone 1 — Discovery",
              amount: 8000,
              dueDate: new Date("2025-02-01"),
              status: "PAID",
              paidAt: new Date("2025-02-03"),
            },
            {
              label: "Milestone 2 — Development",
              amount: 8000,
              dueDate: new Date("2026-04-01"),
              status: "PENDING",
            },
            {
              label: "Milestone 3 — Launch",
              amount: 8000,
              dueDate: new Date("2026-08-01"),
              status: "PENDING",
            },
          ],
        },
      },
    });

    const demoTicketSubject = "Request staging environment access";
    const existingTicket = await prisma.ticket.findFirst({
      where: { clientId: clientProfile.id, subject: demoTicketSubject },
    });
    if (!existingTicket) {
    await prisma.ticket.create({
      data: {
        clientId: clientProfile.id,
        subject: demoTicketSubject,
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        createdById: clientUser.id,
        assignedToId: staffUser.id,
        messages: {
          create: [
            {
              userId: clientUser.id,
              message: "Could we get VPN credentials for the staging server?",
              isStaff: false,
            },
            {
              userId: staffUser.id,
              message: "Credentials will be sent to your registered email within 24 hours.",
              isStaff: true,
            },
          ],
        },
      },
    });
    }

    for (const coupon of [
      {
        code: "WELCOME10",
        description: "10% off first online payment",
        discountPercent: 10,
        minOrderAmount: 100,
        maxUses: 100,
      },
      {
        code: "LAUNCH500",
        description: "$500 flat discount on large invoices",
        discountAmount: 500,
        minOrderAmount: 5000,
        maxUses: 20,
      },
    ]) {
      await prisma.coupon.upsert({
        where: { code: coupon.code },
        update: coupon,
        create: coupon,
      });
    }

  }

  const { servicesCatalog } = await import("../src/lib/services-catalog");

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

  const catalogSlugs = servicesCatalog.map((s) => s.slug);
  await prisma.service.updateMany({
    where: { slug: { notIn: catalogSlugs } },
    data: { isActive: false },
  });

  console.log("Seed complete.");
  console.log("Admin: admin@netzor.io / Admin@123");
  console.log("Staff: staff@netzor.io / Staff@123");
  console.log("Client: client@demo.io / Client@123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
