import { RazorpayButton } from "@/components/payment/RazorpayButton";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ShieldCheck, Zap, Lock } from "lucide-react";

export const metadata = {
  title: "Razorpay Test Checkout | NETZOR",
};

export default function TestPaymentPage() {
  return (
    <div className="mesh-bg flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md border-accent/30 bg-surface-elevated/80 backdrop-blur shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent-glow border border-accent/20">
            <Zap className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">Razorpay Standard Checkout</CardTitle>
          <p className="text-xs text-muted mt-1">
            Test live payment popup (Cards, UPI, NetBanking, Wallets)
          </p>
        </CardHeader>

        <div className="space-y-5 px-6 pb-6 pt-2">
          <div className="rounded-xl bg-surface p-4 border border-border text-sm space-y-2">
            <div className="flex justify-between text-muted text-xs">
              <span>Item</span>
              <span>Test Service Activation</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
              <span>Amount Due</span>
              <span className="text-accent-glow">₹500.00</span>
            </div>
          </div>

          <RazorpayButton
            amount={500}
            name="NETZOR"
            description="Test Checkout Demo"
            prefill={{
              name: "Demo User",
              email: "test@netzor.in",
              contact: "9876543210",
            }}
            className="w-full h-11 justify-center text-sm font-semibold shadow-lg shadow-accent/20"
          />

          <div className="flex items-center justify-center gap-4 text-[11px] text-muted pt-2 border-t border-border/60">
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3 text-accent" /> 256-bit Encrypted
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-success" /> Razorpay Verified
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
