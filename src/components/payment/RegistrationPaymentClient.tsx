"use client";

import { useRouter } from "next/navigation";
import { NetzorPayCheckout } from "./NetzorPayCheckout";

type Props = {
  invoiceId: string;
  amount: number;
  razorpayEnabled: boolean;
};

export function RegistrationPaymentClient({
  invoiceId,
  amount,
  razorpayEnabled,
}: Props) {
  const router = useRouter();

  async function onPaymentSuccess() {
    await fetch("/api/auth/refresh-session", { method: "POST" });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <NetzorPayCheckout
      invoiceId={invoiceId}
      maxAmount={amount}
      defaultAmount={amount}
      razorpayEnabled={razorpayEnabled}
      registrationMode
      onSuccess={onPaymentSuccess}
    />
  );
}
