"use client";

import { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card, CardHeader, CardTitle } from "../ui/Card";
import { Shield, Lock, CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import { formatRupee } from "@/lib/utils";
import { loadRazorpayScript, RazorpayPaymentResponse } from "@/lib/load-razorpay";

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
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [preview, setPreview] = useState<{ discount: number; message?: string } | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function applyCoupon() {
    if (!coupon.trim()) return;
    setError("");
    setApplyingCoupon(true);
    try {
      const res = await fetch("/api/payments/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon.trim(), amount: parseFloat(amount) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPreview(null);
        setError(data.error || "Invalid coupon code");
        return;
      }
      setPreview({ discount: data.discount, message: data.message });
    } catch {
      setError("Failed to apply coupon");
    } finally {
      setApplyingCoupon(false);
    }
  }

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Step 1: Create Order on backend
      const orderRes = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId,
          installmentId,
          amount: parseFloat(amount),
          couponCode: coupon.trim() || undefined,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        setError(orderData.error || "Could not initialize payment");
        setLoading(false);
        return;
      }

      // Step 2A: Handle simulated mode (when keys are not configured or in local dev)
      if (orderData.simulated) {
        const verifyRes = await fetch("/api/payments/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentId: orderData.paymentId,
            simulated: true,
          }),
        });

        const verifyData = await verifyRes.json();
        setLoading(false);

        if (!verifyRes.ok) {
          setError(verifyData.error || "Payment verification failed");
          return;
        }

        setSuccess(`Payment successful. Transaction ID: ${verifyData.transactionId}`);
        if (onSuccess) {
          await onSuccess(verifyData.transactionId);
        } else {
          setTimeout(() => window.location.reload(), 1200);
        }
        return;
      }

      // Step 2B: Real Razorpay Gateway Flow
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        setError("Razorpay SDK failed to load. Please check your internet connection.");
        setLoading(false);
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "NETZOR",
        description: registrationMode ? "Account Activation Fee" : "Invoice Payment",
        order_id: orderData.orderId,
        prefill: {
          name: orderData.customer?.name || "",
          email: orderData.customer?.email || "",
          contact: orderData.customer?.phone || "",
        },
        theme: {
          color: "#6366f1", // Accent indigo
          backdrop_color: "rgba(10, 10, 15, 0.85)",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
        handler: async (response: RazorpayPaymentResponse) => {
          setLoading(true);
          try {
            // Step 3: Verify Razorpay Signature on Server
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paymentId: orderData.paymentId,
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

            setSuccess(`Payment verified! Transaction: ${verifyData.transactionId}`);
            if (onSuccess) {
              await onSuccess(verifyData.transactionId);
            } else {
              setTimeout(() => window.location.reload(), 1200);
            }
          } catch (err) {
            setLoading(false);
            setError(err instanceof Error ? err.message : "Verification request failed");
          }
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", (response: unknown) => {
        const failure = response as { error?: { description?: string } };
        setError(failure?.error?.description || "Payment was rejected or cancelled");
        setLoading(false);
      });

      razorpayInstance.open();
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    }
  }

  const numAmount = parseFloat(amount) || 0;
  const discount = preview?.discount ?? 0;
  const total = Math.max(0, numAmount - discount);

  return (
    <Card className="border-accent/30 bg-surface-elevated/60 backdrop-blur shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-accent-glow" />
            Netzor Pay
            <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-accent/15 text-accent-glow border border-accent/20">
              Razorpay Secured
            </span>
          </CardTitle>
          <p className="text-xs text-muted mt-1">
            {registrationMode
              ? "One-time registration fee · UPI, Cards, NetBanking, Wallets"
              : "Instant secure invoice payments via Razorpay Gateway"}
          </p>
        </div>
        <Lock className="h-7 w-7 text-accent/50" />
      </CardHeader>

      <form className="space-y-4 px-6 pb-6" onSubmit={handlePayment}>
        {!registrationMode ? (
          <>
            <Input
              label="Payment amount (₹)"
              type="number"
              min={1}
              max={maxAmount}
              step="0.01"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setPreview(null);
              }}
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
                disabled={applyingCoupon || !coupon.trim()}
              >
                {applyingCoupon ? "Checking…" : "Apply"}
              </Button>
            </div>

            {preview && (
              <div className="flex items-center gap-1.5 text-xs text-success">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>
                  Discount applied: {formatRupee(preview.discount)}
                  {preview.message && ` — ${preview.message}`}
                </span>
              </div>
            )}
          </>
        ) : null}

        <div className="rounded-xl bg-surface p-3.5 text-sm border border-border space-y-2">
          <div className="flex justify-between text-muted text-xs">
            <span>Subtotal</span>
            <span>{formatRupee(numAmount)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-success text-xs">
              <span>Coupon discount</span>
              <span>-{formatRupee(discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-base pt-2 border-t border-border/80">
            <span>Total Payable</span>
            <span className="text-accent-glow">{formatRupee(total)}</span>
          </div>
          <div className="flex items-center gap-2 pt-1 text-[11px] text-muted">
            <CreditCard className="h-3.5 w-3.5 text-accent" />
            <span>Supported: UPI (GPay/PhonePe), Credit/Debit Cards, NetBanking, EMI</span>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20 text-xs text-danger">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-success/10 border border-success/20 text-xs text-success">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
            {!registrationMode && (
              <a
                href={`/dashboard/billing/invoice/${invoiceId}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-surface-elevated hover:bg-surface border border-accent/40 text-xs font-semibold text-accent transition-colors"
              >
                <span>📄 View & Download Invoice Receipt</span>
              </a>
            )}
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-11 text-sm font-semibold tracking-wide shadow-lg shadow-accent/20"
          disabled={loading || total <= 0}
        >
          {loading ? (
            <span className="flex items-center gap-2 justify-center">
              <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              Opening Razorpay…
            </span>
          ) : (
            `Pay ${formatRupee(total)} with Razorpay`
          )}
        </Button>
      </form>
    </Card>
  );
}
