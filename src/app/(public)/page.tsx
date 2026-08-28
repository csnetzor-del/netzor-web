import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getPublicServices } from "@/lib/services";
import { siteImages } from "@/lib/site-images";
import { HeroSlider } from "@/components/marketing/HeroSlider";
import { BackgroundSection } from "@/components/marketing/BackgroundSection";
import { FeatureShowcase } from "@/components/marketing/FeatureShowcase";
import { ServiceImageCard } from "@/components/marketing/ServiceImageCard";
import {
  ArrowRight,
  Cloud,
  Code,
  Headphones,
  Palette,
  Shield,
  BarChart3,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  code: Code,
  cloud: Cloud,
  palette: Palette,
  headphones: Headphones,
  shield: Shield,
};

const heroSlides = [
  {
    id: "portal",
    image: siteImages.hero.portal,
    imageAlt: "Analytics dashboard and project tracking",
    eyebrow: "Enterprise IT · Secure Client Portal",
    title: (
      <>
        Build smarter. <span className="text-accent-glow">Track everything.</span>
      </>
    ),
    subtitle:
      "Custom software, cloud infrastructure, and dedicated support — with a unified portal for projects, installments, and Netzor Pay.",
    cta: { label: "Open your account", href: "/auth/signup" },
    ctaSecondary: { label: "Explore services", href: "/services" },
  },
  {
    id: "ai",
    image: siteImages.hero.ai,
    imageAlt: "Artificial intelligence and machine learning",
    eyebrow: "Artificial intelligence",
    title: "AI-powered delivery, measurable outcomes",
    subtitle:
      "From strategy to production — we help you move from ambition to ROI with secure, outcome-focused engineering.",
    cta: { label: "View services", href: "/services" },
    ctaSecondary: { label: "Contact us", href: "/contact" },
  },
  {
    id: "team",
    image: siteImages.hero.consulting,
    imageAlt: "Business consulting and IT integration meeting",
    eyebrow: "Consulting & integration",
    title: "Your partner for end-to-end transformation",
    subtitle:
      "Business consulting, systems integration, and managed IT — delivered with transparency through your client dashboard.",
    cta: { label: "Sign in to portal", href: "/auth/signin" },
    ctaSecondary: { label: "About Netzor", href: "/about" },
  },
];

export default async function HomePage() {
  const services = (await getPublicServices("core")).slice(0, 4);

  return (
    <div>
      <HeroSlider slides={heroSlides} />

      <section className="relative bg-background px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Shield, title: "Netzor Pay", desc: "Encrypted payments & coupon discounts" },
              { icon: BarChart3, title: "Live tracking", desc: "Projects, milestones & documents" },
              { icon: Headphones, title: "24/7 support", desc: "Ticketing with your dedicated team" },
            ].map((f) => (
              <Card key={f.title} className="flex gap-4 border-border/80">
                <f.icon className="h-8 w-8 shrink-0 text-accent" />
                <div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted mt-1">{f.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <BackgroundSection
        imageSrc={siteImages.home.servicesBg}
        imageAlt="Software development and IT services workspace"
        overlay="dark"
        className="py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-sm font-medium uppercase tracking-wider text-accent-glow">
            End-to-end services
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Our services</h2>
          <p className="mt-3 text-white/70 max-w-2xl">
            Solutions engineered for growth-stage businesses — insights-driven and outcomes-focused.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {services.map((s) => {
              const Icon = iconMap[s.icon] || Code;
              return (
                <ServiceImageCard
                  key={s.id}
                  slug={s.slug}
                  title={s.title}
                  description={s.shortDesc || s.description}
                  icon={<Icon className="h-8 w-8" />}
                  iconKey={s.icon}
                  priceFrom={s.priceFrom}
                />
              );
            })}
          </div>
          <Link href="/services" className="inline-block mt-10">
            <Button variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
              View all services
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </BackgroundSection>

      <section className="bg-background px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-24">
          <FeatureShowcase
            title="Secure software delivery"
            description="Agile squads, documented milestones, and real-time project visibility — so you always know where your investment stands."
            imageSrc={siteImages.home.softwareDelivery}
            imageAlt="Software engineering team delivering a project"
            href="/dashboard/projects"
            linkLabel="Client portal"
          />
          <FeatureShowcase
            title="Cloud, data & cybersecurity"
            description="Infrastructure design, analytics, and hardened operations — built for scale and compliance from day one."
            imageSrc={siteImages.home.cloudSecurity}
            imageAlt="Cloud data center and cybersecurity infrastructure"
            href="/services"
            linkLabel="Explore capabilities"
            reverse
          />
        </div>
      </section>

      <BackgroundSection
        imageSrc={siteImages.home.portalCta}
        imageAlt="Modern office inviting clients to the portal"
        overlay="medium"
        className="py-24"
      >
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready for your client portal?
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Register or sign in to manage projects, pay installments, and reach our team.
          </p>
          <Link href="/auth/signin" className="inline-block mt-8">
            <Button size="lg">Sign in to portal</Button>
          </Link>
        </div>
      </BackgroundSection>
    </div>
  );
}
