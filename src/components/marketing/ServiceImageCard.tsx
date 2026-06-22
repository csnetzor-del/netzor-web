import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { getServiceImage, getServiceImageAlt } from "@/lib/site-images";

type ServiceImageCardProps = {
  slug: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconKey: string;
  priceFrom?: number | null;
};

export function ServiceImageCard({
  slug,
  title,
  description,
  icon,
  iconKey,
  priceFrom,
}: ServiceImageCardProps) {
  const image = getServiceImage(slug, iconKey);
  const imageAlt = getServiceImageAlt(slug, title);

  return (
    <Card className="overflow-hidden p-0 group hover:border-accent/50 transition-all hover:shadow-xl hover:shadow-accent/15">
      <div className="relative h-44 w-full overflow-hidden">
        <Image
          src={image}
          alt={imageAlt}
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
