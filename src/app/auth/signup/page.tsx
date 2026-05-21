"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Logo } from "@/components/brand/Logo";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        companyName: form.get("companyName"),
        phone: form.get("phone"),
        email: form.get("email"),
        address: form.get("address"),
        password: form.get("password"),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Registration failed");
      return;
    }
    router.push(data.redirect || "/auth/signup/payment");
    router.refresh();
  }

  return (
    <div className="mesh-bg flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <Logo size="xl" showText={false} href={null} />
          </div>
          <CardTitle>Create client account</CardTitle>
          <p className="text-sm text-muted mt-1">
            Register, then pay ₹500 to activate your portal access
          </p>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Client name" name="name" required />
          <Input label="Company name" name="companyName" />
          <Input label="Phone number" name="phone" type="tel" />
          <Input label="Email" name="email" type="email" required />
          <div className="space-y-1.5">
            <label htmlFor="address" className="block text-sm text-muted">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              required
              rows={3}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <Input
            label="Password"
            name="password"
            type="password"
            required
            minLength={8}
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          Already registered?{" "}
          <Link href="/auth/signin" className="text-accent-glow hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
