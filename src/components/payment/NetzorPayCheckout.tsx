"use client";

import { useCallback, useState } from "react";
import Script from "next/script";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card, CardHeader, CardTitle } from "../ui/Card";
import { Shield, Lock } from "lucide-react";
import { formatRupee } from "@/lib/utils";

type Props = {
  invoiceId: string;
  installmentId?: string;
  maxAmount: number;
  defaultAmount?: number;
  onSuccess?: (txId: string) => void;
  razorpayEnabled?: boolean;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color: string };
  modal?: { ondismiss: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

export function NetzorPayCheckout({
  invoiceId,
  installmentId,
  maxAmount,
  defaultAmount,
  onSuccess,
  razorpayEnabled = false,
}: Props) {
  const [amount, setAmount] = useState(String(defaultAmount ?? maxAmount));
  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{ discount: number; message?: string } | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [scriptReady, setScriptReady] = useState(false);

  async function applyCoupon() {
    setError("");
    const res = await fetch("/api/payments/coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon, amount: parseFloat(amount) }),
    });
    const data = await res.json();
    if (!res.ok) {
      setPreview(null);
      setError(data.error || "Invalid coupon");
      return;
    }
    setPreview({ discount: data.discount, message: data.message });
  }

  const payWithRazorpay = useCallback(async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    const res = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoiceId,
        installmentId,
        amount: parseFloat(amount),
        couponCode: coupon || undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Could not start payment");
      return;
    }

    if (!window.Razorpay) {
      setError("Payment gateway loading. Please try again.");
      return;
    }

    const rzp = new window.Razorpay({
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: "NETZOR",
      description: "Netzor Pay — Invoice payment",
      order_id: data.razorpayOrderId,
      prefill: data.prefill,
      theme: { color: "#007fff" },
      handler: async (response) => {
        setLoading(true);
        const verifyRes = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentId: data.paymentId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });
        const verifyData = await verifyRes.json();
        setLoading(false);

        if (!verifyRes.ok) {
          setError(verifyData.error || "Payment verification failed");
          return;
        }

        setSuccess(`Payment successful. Transaction: ${verifyData.transactionId}`);
        onSuccess?.(verifyData.transactionId);
        window.location.reload();
      },
      modal: {
        ondismiss: () => setLoading(false),
      },
    });
    rzp.open();
  }, [amount, coupon, invoiceId, installmentId, onSuccess]);

  async function paySimulated(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const res = await fetch("/api/payments/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoiceId,
        installmentId,
        amount: parseFloat(amount),
        couponCode: coupon || undefined,
        cardLast4: "4242",
        cardBrand: "visa",
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Payment failed");
      return;
    }

    setSuccess(`Payment successful. Transaction: ${data.transactionId}`);
    onSuccess?.(data.transactionId);
  }

  const numAmount = parseFloat(amount) || 0;
  const discount = preview?.discount ?? 0;
  const total = Math.max(0, numAmount - discount);

  return (
    <>
      {razorpayEnabled && (
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          onReady={() => setScriptReady(true)}
        />
      )}
      <Card className="border-accent/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              Netzor Pay
            </CardTitle>
            <p className="text-sm text-muted mt-1">
              {razorpayEnabled
                ? "Secured by Razorpay · UPI, cards & netbanking"
                : "Development mode · simulated payments"}
            </p>
          </div>
          <Lock className="h-8 w-8 text-accent/40" />
        </CardHeader>

        <div className="space-y-4">
          <Input
            label="Payment amount"
            type="number"
            min={1}
            max={maxAmount}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <div className="flex gap-2">
            <Input
              label="Coupon code"
              placeholder="e.g. WELCOME10"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
              className="flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              className="mt-6"
              onClick={applyCoupon}
            >
              Apply
            </Button>
          </div>

          {preview && (
            <p className="text-sm text-success">
              Discount applied: {formatRupee(preview.discount)}
              {preview.message && ` — ${preview.message}`}
            </p>
          )}

          <div className="rounded-lg bg-surface-elevated p-3 text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span>{formatRupee(numAmount)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-success mt-1">
                <span>Discount</span>
                <span>-{formatRupee(discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-border">
              <span>Total due</span>
              <span>{formatRupee(total)}</span>
            </div>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}
          {success && <p className="text-sm text-success">{success}</p>}

          {razorpayEnabled ? (
            <Button
              type="button"
              className="w-full"
              disabled={loading || !scriptReady}
              onClick={payWithRazorpay}
            >
              {loading
                ? "Processing…"
                : !scriptReady
                  ? "Loading gateway…"
                  : `Pay ${formatRupee(total)} with Netzor Pay`}
            </Button>
          ) : (
            <form onSubmit={paySimulated}>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Processing…" : `Pay ${formatRupee(total)} (test mode)`}
              </Button>
            </form>
          )}
        </div>
      </Card>
    </>
  );
}
