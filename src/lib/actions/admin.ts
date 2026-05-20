"use server";

import { revalidatePath } from "next/cache";
import { getSession, hashPassword, canAccessAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateClientCode } from "@/lib/utils";
import type { ProjectStatus, Role } from "@prisma/client";

async function requireAdmin() {
  const session = await getSession();
  if (!session || !canAccessAdmin(session.role)) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function createClientAccount(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name"));
  const email = String(formData.get("email")).toLowerCase();
  const password = String(formData.get("password"));
  const companyName = String(formData.get("companyName") || "");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already exists");

  let clientCode = generateClientCode();
  while (await prisma.clientProfile.findUnique({ where: { clientCode } })) {
    clientCode = generateClientCode();
  }

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: "CLIENT",
      clientProfile: {
        create: { companyName: companyName || null, clientCode },
      },
    },
  });

  revalidatePath("/admin/clients");
}

export async function updateProjectStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("projectId"));
  const status = String(formData.get("status")) as ProjectStatus;
  const progress = parseInt(String(formData.get("progress")), 10);

  await prisma.project.update({
    where: { id },
    data: { status, progress: isNaN(progress) ? undefined : progress },
  });

  await prisma.projectUpdate.create({
    data: {
      projectId: id,
      title: "Status updated",
      message: `Project marked as ${status.replace("_", " ")} (${progress}% progress).`,
    },
  });

  revalidatePath("/admin/projects");
}

export async function addProjectUpdate(formData: FormData) {
  await requireAdmin();
  await prisma.projectUpdate.create({
    data: {
      projectId: String(formData.get("projectId")),
      title: String(formData.get("title")),
      message: String(formData.get("message")),
    },
  });
  revalidatePath("/admin/projects");
}

export async function createProject(formData: FormData) {
  await requireAdmin();
  await prisma.project.create({
    data: {
      clientId: String(formData.get("clientId")),
      title: String(formData.get("title")),
      description: String(formData.get("description") || ""),
      status: "PLANNING",
      progress: 0,
    },
  });
  revalidatePath("/admin/projects");
}

export async function upsertService(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const data = {
    title: String(formData.get("title")),
    slug: String(formData.get("slug")),
    description: String(formData.get("description")),
    shortDesc: String(formData.get("shortDesc") || ""),
    icon: String(formData.get("icon") || "code"),
    priceFrom: parseFloat(String(formData.get("priceFrom") || "0")) || null,
    isActive: formData.get("isActive") === "on",
    sortOrder: parseInt(String(formData.get("sortOrder") || "0"), 10),
  };

  if (id) {
    await prisma.service.update({ where: { id }, data });
  } else {
    await prisma.service.create({ data });
  }
  revalidatePath("/admin/services");
  revalidatePath("/services");
}

export async function createCoupon(formData: FormData) {
  await requireAdmin();
  await prisma.coupon.create({
    data: {
      code: String(formData.get("code")).toUpperCase(),
      description: String(formData.get("description") || ""),
      discountPercent: formData.get("discountPercent")
        ? parseFloat(String(formData.get("discountPercent")))
        : null,
      discountAmount: formData.get("discountAmount")
        ? parseFloat(String(formData.get("discountAmount")))
        : null,
      minOrderAmount: parseFloat(String(formData.get("minOrderAmount") || "0")),
      maxUses: formData.get("maxUses")
        ? parseInt(String(formData.get("maxUses")), 10)
        : null,
    },
  });
  revalidatePath("/admin/coupons");
}

export async function createStaffUser(formData: FormData) {
  const session = await requireAdmin();
  if (session.role !== "ADMIN") throw new Error("Admin only");

  const email = String(formData.get("email")).toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email exists");

  const permissions = String(formData.get("permissions") || "[]");

  await prisma.user.create({
    data: {
      name: String(formData.get("name")),
      email,
      passwordHash: await hashPassword(String(formData.get("password"))),
      role: (String(formData.get("role") || "STAFF")) as Role,
      staffProfile: {
        create: {
          department: String(formData.get("department") || ""),
          permissions,
        },
      },
    },
  });
  revalidatePath("/admin/staff");
}

export async function updateTicketAdmin(formData: FormData) {
  await requireAdmin();
  await prisma.ticket.update({
    where: { id: String(formData.get("ticketId")) },
    data: {
      status: String(formData.get("status")) as "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED",
      assignedToId: String(formData.get("assignedToId") || "") || null,
    },
  });
  revalidatePath("/admin/tickets");
}

export async function createInvoice(formData: FormData) {
  await requireAdmin();
  const total = parseFloat(String(formData.get("totalAmount")));
  const invoiceNo = `INV-${Date.now().toString().slice(-6)}`;

  await prisma.invoice.create({
    data: {
      clientId: String(formData.get("clientId")),
      invoiceNo,
      title: String(formData.get("title")),
      totalAmount: total,
      status: "PENDING",
      installments: {
        create: [
          {
            label: "Installment 1",
            amount: total / 3,
            dueDate: new Date(Date.now() + 30 * 86400000),
          },
          {
            label: "Installment 2",
            amount: total / 3,
            dueDate: new Date(Date.now() + 90 * 86400000),
          },
          {
            label: "Installment 3",
            amount: total / 3,
            dueDate: new Date(Date.now() + 180 * 86400000),
          },
        ],
      },
    },
  });
  revalidatePath("/admin/payments");
}
