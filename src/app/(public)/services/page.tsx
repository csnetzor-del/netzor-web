import { getPublicServices } from "@/lib/services";
import { siteImages } from "@/lib/site-images";
import { PageHero } from "@/components/marketing/PageHero";
import { ServicesSection } from "@/components/marketing/ServicesSection";

export default async function ServicesPage() {
  const services = await getPublicServices("all");

  return (
    <div>
      <PageHero
        eyebrow="IT Services"
        title="Comprehensive technology services for your business"
        subtitle="From cybersecurity and managed IT to AI, software development, and digital transformation — we deliver end-to-end solutions with measurable outcomes."
        imageSrc={siteImages.sections.services}
        imageAlt="IT services"
      />

      <section className="bg-background px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <ServicesSection services={services} />
        </div>
      </section>
    </div>
  );
}
