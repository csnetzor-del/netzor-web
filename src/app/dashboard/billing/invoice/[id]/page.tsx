import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InvoiceDocument } from "@/components/invoice/InvoiceDocument";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceViewPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/auth/signin");
  }

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      client: {
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      },
      installments: { orderBy: { dueDate: "asc" } },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!invoice) {
    notFound();
  }

  // Security check: Client can only view their own invoice (admin/staff can view any)
  if (session.role === "CLIENT" && invoice.clientId !== session.clientProfileId) {
    notFound();
  }

  return (
    <div className="py-6 px-4 sm:px-6">
      <InvoiceDocument invoice={invoice} />
    </div>
  );
}
