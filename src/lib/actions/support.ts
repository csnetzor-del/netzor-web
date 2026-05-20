"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createTicket(formData: FormData) {
  const session = await getSession();
  if (!session?.clientProfileId) throw new Error("Unauthorized");

  const subject = String(formData.get("subject"));
  const message = String(formData.get("message"));
  const priority = String(formData.get("priority") || "MEDIUM") as
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "URGENT";

  await prisma.ticket.create({
    data: {
      clientId: session.clientProfileId,
      subject,
      priority,
      createdById: session.id,
      messages: {
        create: {
          userId: session.id,
          message,
          isStaff: false,
        },
      },
    },
  });

  revalidatePath("/dashboard/support");
}

export async function replyToTicket(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const ticketId = String(formData.get("ticketId"));
  const message = String(formData.get("message"));

  const ticket = await prisma.ticket.findFirst({
    where: {
      id: ticketId,
      ...(session.clientProfileId
        ? { clientId: session.clientProfileId }
        : {}),
    },
  });

  if (!ticket) throw new Error("Ticket not found");

  await prisma.ticketMessage.create({
    data: {
      ticketId,
      userId: session.id,
      message,
      isStaff: session.role !== "CLIENT",
    },
  });

  revalidatePath("/dashboard/support");
  revalidatePath("/admin/tickets");
}
