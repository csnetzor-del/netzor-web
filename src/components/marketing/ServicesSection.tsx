import { ServiceDetailCard } from "./ServiceDetailCard";
import {
  serviceCategoryLabels,
  parseServiceFeatures,
  type ServiceCategory,
} from "@/lib/services-catalog";

export type ServiceForDisplay = {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDesc?: string | null;
  emoji?: string | null;
  icon: string;
  category: string;
  features: string;
  priceFrom?: number | null;
};

type ServicesSectionProps = {
  services: ServiceForDisplay[];
  variant?: "page" | "home";
};

export function ServicesSection({
  services,
  variant = "page",
}: ServicesSectionProps) {
  const categories: ServiceCategory[] = ["core", "advanced"];

  return (
    <div className="space-y-16">
      {categories.map((cat) => {
        const items = services.filter((s) => s.category === cat);
        if (items.length === 0) return null;

        return (
          <div key={cat}>
            <div className="mb-8">
              <h2
                className={
                  variant === "home"
                    ? "text-2xl font-bold text-white sm:text-3xl"
                    : "text-2xl font-bold text-foreground sm:text-3xl"
                }
              >
                {serviceCategoryLabels[cat]}
              </h2>
              {cat === "core" && (
                <p
                  className={
                    variant === "home"
                      ? "mt-2 text-white/70"
                      : "mt-2 text-muted"
                  }
                >
                  Essential services to secure, support, and run your IT environment.
                </p>
              )}
              {cat === "advanced" && (
                <p
                  className={
                    variant === "home"
                      ? "mt-2 text-white/70"
                      : "mt-2 text-muted"
                  }
                >
                  Advanced capabilities for innovation, data, and digital growth.
                </p>
              )}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {items.map((s) => (
                <ServiceDetailCard
                  key={s.id}
                  title={s.title}
                  emoji={s.emoji}
                  description={s.description}
                  features={parseServiceFeatures(s.features)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
