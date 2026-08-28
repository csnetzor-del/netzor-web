import { prisma } from "@/lib/prisma";
import { isRegistrationInvoice } from "@/lib/registration";

export async function assertClientCanPayInvoice(
  userId: string,
  clientProfileId: string,
  invoice: { invoiceNo: string; title: string; clientId: string }
) {
  if (invoice.clientId !== clientProfileId) {
    return { ok: false as const, error: "Invoice not found", status: 404 };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { ok: false as const, error: "Unauthorized", status: 401 };
  }

  if (!user.isActive && !isRegistrationInvoice(invoice)) {
    return {
      ok: false as const,
      error: "Complete registration payment to access billing",
      status: 403,
    };
  }

  return { ok: true as const };
}
