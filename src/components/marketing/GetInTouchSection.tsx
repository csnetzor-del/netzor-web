import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { siteContact } from "@/lib/site-config";
import { MessageCircle } from "lucide-react";
import { servicesCatalog } from "@/lib/services-catalog";

import { cn } from "@/lib/utils";

type GetInTouchSectionProps = {
  showSuccess?: boolean;
  onDark?: boolean;
};

export function GetInTouchSection({
  showSuccess,
  onDark = false,
}: GetInTouchSectionProps) {
  return (
    <div
      className={cn(!onDark && "bg-background px-4 py-16 sm:px-6 lg:py-20")}
      id="get-in-touch"
    >
      <div className={cn(onDark ? "" : "mx-auto max-w-7xl")}>
        <div className="max-w-2xl">
          <h2
            className={cn(
              "text-3xl font-bold sm:text-4xl",
              onDark && "text-white"
            )}
          >
            Get In Touch
          </h2>
          <p
            className={cn(
              "mt-4 text-lg",
              onDark ? "text-white/80" : "text-muted"
            )}
          >
            Ready to transform your business? Let&apos;s discuss your IT needs.
          </p>
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <Card
              className={cn(
                "flex gap-4 items-start",
                onDark && "bg-surface/85 backdrop-blur-md border-white/10"
              )}
            >
              <span className="text-2xl" aria-hidden>
                📧
              </span>
              <div>
                <h3 className="font-semibold">Email</h3>
                <a
                  href={`mailto:${siteContact.email}`}
                  className="mt-1 block text-accent-glow hover:underline"
                >
                  {siteContact.email}
                </a>
              </div>
            </Card>
            <Card
              className={cn(
                "flex gap-4 items-start",
                onDark && "bg-surface/85 backdrop-blur-md border-white/10"
              )}
            >
              <span className="text-2xl" aria-hidden>
                💬
              </span>
              <div>
                <h3 className="font-semibold">WhatsApp</h3>
                <a
                  href={siteContact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-2 text-accent-glow hover:underline"
                >
                  <MessageCircle className="h-4 w-4" />
                  {siteContact.whatsappLabel}
                </a>
              </div>
            </Card>
            <p className={cn("text-sm", onDark ? "text-white/70" : "text-muted")}>
              Existing clients can also use the{" "}
              <Link href="/auth/signin" className="text-accent-glow hover:underline">
                client portal
              </Link>{" "}
              for fastest support.
            </p>
          </div>

          <Card
            className={cn(
              "lg:col-span-3",
              onDark && "bg-surface/90 backdrop-blur-md border-white/10"
            )}
          >
            <CardHeader>
              <CardTitle>Get in touch</CardTitle>
            </CardHeader>
            {showSuccess && (
              <p className="mb-4 rounded-lg bg-success/10 border border-success/30 px-4 py-3 text-sm text-success">
                Thank you! Your message has been received. We&apos;ll get back to you soon.
              </p>
            )}
            <form className="space-y-4" action="/api/contact" method="POST">
              <Input label="Your Name" name="name" required />
              <Input label="Your Email" name="email" type="email" required />
              <Input label="Your Phone" name="phone" type="tel" />
              <div>
                <label className="block text-sm text-muted mb-1.5">
                  Select a Service
                </label>
                <select
                  name="service"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  defaultValue=""
                >
                  <option value="">Select a service…</option>
                  {servicesCatalog.map((s) => (
                    <option key={s.slug} value={s.title}>
                      {s.title}
                    </option>
                  ))}
                  <option value="Other">Other / General inquiry</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-muted mb-1.5">
                  Your Message
                </label>
                <textarea
                  name="message"
                  rows={5}
                  required
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <Button type="submit">Send Message</Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}