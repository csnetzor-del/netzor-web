import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { siteContact } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="border-t border-border bg-white/70 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo size="md" href="/" />
            <p className="mt-3 max-w-md text-sm text-muted">
              NETZOR is a leading IT solutions provider — comprehensive technology
              services for businesses of all sizes.
            </p>
            <p className="mt-2 text-sm">
              <a href={`mailto:${siteContact.email}`} className="text-accent-glow hover:underline">
                {siteContact.email}
              </a>
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li><Link href="/about" className="hover:text-accent-glow">About</Link></li>
              <li><Link href="/services" className="hover:text-accent-glow">Services</Link></li>
              <li><Link href="/contact" className="hover:text-accent-glow">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-foreground">Portal</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li><Link href="/auth/signin" className="hover:text-accent-glow">Client login</Link></li>
              <li><Link href="/auth/signup" className="hover:text-accent-glow">Register</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-border pt-6 text-center text-xs text-muted">
          © {new Date().getFullYear()} Netzor Technologies. Secure payments via Netzor Pay.
        </p>
      </div>
    </footer>
  );
}
