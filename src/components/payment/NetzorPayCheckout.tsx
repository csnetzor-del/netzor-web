"use client";

import { useState } from "react";
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
  onSuccess?: (txId: string) => void | Promise<void>;
  /** Fixed ₹500 registration — no amount/coupon edits */
  registrationMode?: boolean;
};

export function NetzorPayCheckout({
  invoiceId,
  installmentId,
  maxAmount,
  defaultAmount,
  onSuccess,
  registrationMode = false,
}: Props) {
  const [amount, setAmount] = useState(String(defaultAmount ?? maxAmount));
  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{ discount: number; message?: string } | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  async function pay(e: React.FormEvent) {
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
    if (onSuccess) {
      await onSuccess(data.transactionId);
    } else {
      window.location.reload();
    }
  }

  const numAmount = parseFloat(amount) || 0;
  const discount = preview?.discount ?? 0;
  const total = Math.max(0, numAmount - discount);

  return (
    <Card className="border-accent/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" />
            Netzor Pay
          </CardTitle>
          <p className="text-sm text-muted mt-1">
            {registrationMode
              ? "One-time registration fee · portal access after verification"
              : "Secure invoice payments through your client portal"}
          </p>
        </div>
        <Lock className="h-8 w-8 text-accent/40" />
      </CardHeader>

      <form className="space-y-4" onSubmit={pay}>
        {!registrationMode ? (
          <>
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
          </>
        ) : null}

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

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Processing…" : `Pay ${formatRupee(total)} with Netzor Pay`}
        </Button>
      </form>
    </Card>
  );
}
