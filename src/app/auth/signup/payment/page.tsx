import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/brand/Logo";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { RegistrationPaymentClient } from "@/components/payment/RegistrationPaymentClient";
import {
  REGISTRATION_FEE_INR,
  getRegistrationInvoiceForClient,
} from "@/lib/registration";
import { formatRupee } from "@/lib/utils";

export default async function SignupPaymentPage() {
  const session = await getSession();
  if (!session?.clientProfileId) {
    redirect("/auth/signup");
  }

  if (session.isActive) {
    redirect("/dashboard");
  }

  const invoice = await getRegistrationInvoiceForClient(session.clientProfileId);
  if (!invoice || invoice.status === "PAID") {
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (user?.isActive) redirect("/dashboard");
    redirect("/auth/signin");
  }

  const balance = invoice.totalAmount - invoice.paidAmount;

  return (
    <div className="mesh-bg flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <Logo size="xl" showText={false} href={null} />
          </div>
          <h1 className="text-2xl font-bold">Activate your account</h1>
          <p className="text-sm text-muted mt-2">
            Pay the one-time registration fee to access your client portal
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registration fee</CardTitle>
            <p className="text-3xl font-bold text-accent-glow mt-2">
              {formatRupee(REGISTRATION_FEE_INR)}
            </p>
            <p className="text-sm text-muted mt-1">
              Signed in as {session.email}. Access is granted after payment is
              verified.
            </p>
          </CardHeader>
        </Card>

        <RegistrationPaymentClient invoiceId={invoice.id} amount={balance} />
      </div>
    </div>
  );
}
