import { Card } from "@/components/ui/Card";
import { Check } from "lucide-react";

type ServiceDetailCardProps = {
  title: string;
  emoji?: string | null;
  description: string;
  features: string[];
};

export function ServiceDetailCard({
  title,
  emoji,
  description,
  features,
}: ServiceDetailCardProps) {
  return (
    <Card className="flex h-full flex-col border-border/80 hover:border-accent/30 transition-colors">
      <div className="flex items-start gap-4">
        {emoji && (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-3xl">
            {emoji}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="mt-3 text-sm text-muted leading-relaxed">{description}</p>
        </div>
      </div>
      {features.length > 0 && (
        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2 text-sm text-foreground/90"
            >
              <Check className="h-4 w-4 shrink-0 text-accent-glow" />
              {feature}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
