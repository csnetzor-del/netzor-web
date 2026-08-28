"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { loadRazorpayScript, RazorpayPaymentResponse } from "@/lib/load-razorpay";
import { CreditCard, CheckCircle2, AlertCircle } from "lucide-react";

interface RazorpayButtonProps {
  amount?: number; // in INR (e.g. 500)
  currency?: string;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess?: (response: RazorpayPaymentResponse) => void;
  onFailure?: (error: string) => void;
  className?: string;
}

export function RazorpayButton({
  amount = 500,
  currency = "INR",
  name = "NETZOR",
  description = "Payment",
  prefill,
  onSuccess,
  onFailure,
  className = "",
}: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleCheckout() {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // 1. Create order on backend
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount * 100, // convert to paise
          currency,
        }),
      });

      const orderData = await res.json();

      if (!res.ok || !orderData.order_id) {
        throw new Error(orderData.error || "Failed to create payment order");
      }

      // 2. Load Razorpay SDK
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded || !window.Razorpay) {
        throw new Error("Razorpay SDK failed to load");
      }

      // 3. Open Razorpay Checkout Modal
      const options = {
        key: orderData.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TV8pKT7JywPh0r",
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name,
        description,
        order_id: orderData.order_id,
        prefill: prefill || {
          name: "Customer",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#6366f1",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
        handler: async (response: RazorpayPaymentResponse) => {
          setLoading(true);
          try {
            // 4. Verify signature on backend
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            setLoading(false);

            if (!verifyRes.ok || !verifyData.success) {
              const errMsg = verifyData.error || "Signature verification failed";
              setError(errMsg);
              onFailure?.(errMsg);
              return;
            }

            setSuccess(`Payment verified! ID: ${response.razorpay_payment_id}`);
            onSuccess?.(response);
          } catch (err) {
            setLoading(false);
            const msg = err instanceof Error ? err.message : "Verification failed";
            setError(msg);
            onFailure?.(msg);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (res: unknown) => {
        const failure = res as { error?: { description?: string } };
        const msg = failure?.error?.description || "Payment failed";
        setError(msg);
        onFailure?.(msg);
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      setLoading(false);
      const msg = err instanceof Error ? err.message : "Checkout error";
      setError(msg);
      onFailure?.(msg);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handleCheckout}
        disabled={loading}
        className={`flex items-center gap-2 ${className}`}
      >
        <CreditCard className="h-4 w-4" />
        {loading ? "Processing…" : `Pay ₹${amount} with Razorpay`}
      </Button>

      {error && (
        <div className="flex items-center gap-2 text-xs text-danger bg-danger/10 p-2.5 rounded-lg border border-danger/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-xs text-success bg-success/10 p-2.5 rounded-lg border border-success/20">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
}
