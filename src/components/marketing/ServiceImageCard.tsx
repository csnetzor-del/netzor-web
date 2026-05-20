import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { siteImages } from "@/lib/site-images";

const serviceImages: Record<string, string> = {
  code: siteImages.sections.delivery,
  cloud: siteImages.hero.cloud,
  palette: siteImages.sections.data,
  headphones: siteImages.sections.security,
  shield: siteImages.sections.security,
};

type ServiceImageCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconKey: string;
  priceFrom?: number | null;
};

export function ServiceImageCard({
  title,
  description,
  icon,
  iconKey,
  priceFrom,
}: ServiceImageCardProps) {
  const image = serviceImages[iconKey] || siteImages.sections.services;

  return (
    <Card className="overflow-hidden p-0 group hover:border-accent/40 transition-all hover:shadow-xl hover:shadow-accent/5">
      <div className="relative h-44 w-full overflow-hidden">
        <Image
          src={image}
          alt=""
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
        <div className="absolute bottom-4 left-4 text-accent">{icon}</div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-2 text-muted text-sm line-clamp-2">{description}</p>
        {priceFrom != null && (
          <p className="mt-4 text-sm text-accent-glow font-medium">
            From ${priceFrom.toLocaleString()}
          </p>
        )}
      </div>
    </Card>
  );
}
