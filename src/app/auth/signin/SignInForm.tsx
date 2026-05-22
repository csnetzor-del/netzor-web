"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Logo } from "@/components/brand/Logo";

function SignInFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Sign in failed");
      return;
    }
    router.push(redirect || data.redirect || "/dashboard");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex justify-center">
          <Logo size="xl" showText={false} href={null} />
        </div>
        <CardTitle>Sign in to Netzor</CardTitle>
        <p className="text-sm text-muted mt-1">Client portal & staff access</p>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email" name="email" type="email" required />
        <Input label="Password" name="password" type="password" required />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        No account?{" "}
        <Link href="/auth/signup" className="text-accent-glow hover:underline">
          Register
        </Link>
      </p>
    </Card>
  );
}

export function SignInForm() {
  return (
    <Suspense fallback={<Card className="w-full max-w-md p-8 text-center text-muted">Loading…</Card>}>
      <SignInFormInner />
    </Suspense>
  );
}
