import { trackEvent } from "@/lib/analytics";
import { siteImages } from "@/lib/site-images";
import { PageHero } from "@/components/marketing/PageHero";
import { BackgroundSection } from "@/components/marketing/BackgroundSection";
import { WhyChooseSection } from "@/components/marketing/WhyChooseSection";
import { GetInTouchSection } from "@/components/marketing/GetInTouchSection";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  await trackEvent("page_view", "/contact");
  const params = await searchParams;

  return (
    <div>
      <PageHero
        eyebrow="Contact NETZOR"
        title="Get In Touch"
        subtitle="Ready to transform your business? Let's discuss your IT needs — email, WhatsApp, or the form below."
        imageSrc={siteImages.sections.contact}
        imageAlt="Professional customer support"
        tall
      />

      <BackgroundSection
        imageSrc={siteImages.sections.contactStats}
        imageAlt="Business team planning session"
        overlay="dark"
        className="py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <WhyChooseSection onDark />
        </div>
      </BackgroundSection>

      <BackgroundSection
        imageSrc={siteImages.sections.contactForm}
        imageAlt="Modern technology workspace"
        overlay="medium"
        className="py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <GetInTouchSection showSuccess={params.sent === "1"} onDark />
        </div>
      </BackgroundSection>
    </div>
  );
}
