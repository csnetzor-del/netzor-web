import { prisma } from "@/lib/prisma";

export const REGISTRATION_FEE_INR = 500;
export const REGISTRATION_INVOICE_TITLE = "Client Account Registration";

export function isRegistrationInvoice(invoice: { invoiceNo: string; title: string }) {
  return (
    invoice.title === REGISTRATION_INVOICE_TITLE ||
    invoice.invoiceNo.startsWith("REG-")
  );
}

export async function createRegistrationInvoice(clientProfileId: string, clientCode: string) {
  const invoiceNo = `REG-${clientCode}`;
  const existing = await prisma.invoice.findUnique({ where: { invoiceNo } });
  if (existing) return existing;

  return prisma.invoice.create({
    data: {
      clientId: clientProfileId,
      invoiceNo,
      title: REGISTRATION_INVOICE_TITLE,
      totalAmount: REGISTRATION_FEE_INR,
      paidAmount: 0,
      status: "PENDING",
    },
  });
}

export async function getRegistrationInvoiceForClient(clientProfileId: string) {
  return prisma.invoice.findFirst({
    where: {
      clientId: clientProfileId,
      OR: [
        { title: REGISTRATION_INVOICE_TITLE },
        { invoiceNo: { startsWith: "REG-" } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function activateClientAfterRegistration(clientProfileId: string) {
  const profile = await prisma.clientProfile.findUnique({
    where: { id: clientProfileId },
    select: { userId: true },
  });
  if (!profile) return null;

  await prisma.user.update({
    where: { id: profile.userId },
    data: { isActive: true },
  });

  return profile.userId;
}
