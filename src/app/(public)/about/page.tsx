import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { siteImages } from "@/lib/site-images";
import { PageHero } from "@/components/marketing/PageHero";
import { BackgroundSection } from "@/components/marketing/BackgroundSection";
import { FeatureShowcase } from "@/components/marketing/FeatureShowcase";
import { WhyChooseSection } from "@/components/marketing/WhyChooseSection";
import { GetInTouchSection } from "@/components/marketing/GetInTouchSection";
import { Button } from "@/components/ui/Button";
import {
  Target,
  Users,
  Shield,
  Zap,
} from "lucide-react";

export default async function AboutPage() {
  return (
    <div>
      <PageHero
        eyebrow="About Us"
        title="About NETZOR"
        subtitle="A leading IT solutions partner — combining deep technical expertise with business insight to help organizations grow with confidence."
        imageSrc={siteImages.sections.about}
        imageAlt="NETZOR team and workspace"
      />

      <WhyChooseSection />

      <section className="border-t border-border bg-surface/30 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold sm:text-3xl">What we stand for</h2>
          <p className="mt-3 text-muted max-w-2xl">
            Our mission is to make enterprise-grade technology accessible, transparent, and
            measurable for every client we serve.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Target,
                title: "Outcome-focused",
                body: "Every engagement is tied to clear milestones, reporting, and business value — not just deliverables.",
              },
              {
                icon: Shield,
                title: "Security first",
                body: "Cybersecurity, compliance, and resilient infrastructure are built into everything we deliver.",
              },
              {
                icon: Users,
                title: "Client partnership",
                body: "Dedicated squads, transparent portals, and direct access to experts who know your environment.",
              },
              {
                icon: Zap,
                title: "Innovation at speed",
                body: "From AI and cloud to custom software — we help you adopt modern tech without unnecessary risk.",
              },
            ].map((item) => (
              <Card key={item.title}>
                <item.icon className="h-8 w-8 text-accent mb-4" />
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">{item.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <FeatureShowcase
            title="Expert team, proven delivery"
            description="NETZOR brings together consultants, engineers, cloud specialists, and support professionals — aligned to your industry and scale. Whether you need managed IT, cybersecurity, or full digital transformation, we scale with you."
            imageSrc={siteImages.hero.team}
            imageAlt="NETZOR expert team"
            href="/services"
            linkLabel="Explore our services"
          />
        </div>
      </section>

      <BackgroundSection
        imageSrc={siteImages.sections.cta}
        imageAlt="NETZOR office"
        overlay="dark"
        className="py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="bg-surface/90 backdrop-blur-md">
              <h2 className="text-xl font-semibold">Our approach</h2>
              <p className="mt-4 text-sm text-muted leading-relaxed">
                We start by understanding your business goals, then design technology
                roadmaps that fit your budget and timeline. Delivery runs through agile
                practices with a secure client portal for project status, documents,
                installments, and payments — so you are never left guessing.
              </p>
            </Card>
            <Card className="bg-surface/90 backdrop-blur-md">
              <h2 className="text-xl font-semibold">Organizational structure</h2>
              <ul className="mt-4 space-y-2 text-muted text-sm">
                <li>Executive leadership — strategy & client relationships</li>
                <li>Engineering — software development & quality assurance</li>
                <li>Cloud & infrastructure — DevOps and managed operations</li>
                <li>Cybersecurity — protection, monitoring, and audits</li>
                <li>Client success — onboarding, billing & 24/7 support</li>
              </ul>
            </Card>
          </div>
          <div className="mt-10 text-center">
            <Link href="/contact">
              <Button size="lg">Contact our team</Button>
            </Link>
          </div>
        </div>
      </BackgroundSection>

      <GetInTouchSection />
    </div>
  );
}
