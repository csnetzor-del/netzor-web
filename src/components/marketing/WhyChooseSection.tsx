import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { companyStats, whyChooseNetzor } from "@/lib/site-config";

type WhyChooseSectionProps = {
  onDark?: boolean;
};

export function WhyChooseSection({ onDark = false }: WhyChooseSectionProps) {
  return (
    <div className={cn(!onDark && "bg-background px-4 py-16 sm:px-6 lg:py-20")}>
      <div className={cn(onDark ? "" : "mx-auto max-w-7xl")}>
        <div className="max-w-3xl">
          <h2
            className={cn(
              "text-3xl font-bold sm:text-4xl",
              onDark && "text-white"
            )}
          >
            {whyChooseNetzor.title}
          </h2>
          <p
            className={cn(
              "mt-6 text-lg leading-relaxed",
              onDark ? "text-white/80" : "text-muted"
            )}
          >
            {whyChooseNetzor.description}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {companyStats.map((stat) => (
            <Card
              key={stat.label}
              className={cn(
                "text-center border-accent/20",
                onDark
                  ? "bg-surface/85 backdrop-blur-md border-white/10"
                  : "bg-gradient-to-b from-accent/5 to-transparent"
              )}
            >
              <p className="text-4xl font-bold gradient-text sm:text-5xl">
                {stat.value}
              </p>
              <p
                className={cn(
                  "mt-2 text-sm font-medium",
                  onDark ? "text-white/70" : "text-muted"
                )}
              >
                {stat.label}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}