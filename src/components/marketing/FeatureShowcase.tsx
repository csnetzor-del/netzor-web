import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type FeatureShowcaseProps = {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt?: string;
  href?: string;
  linkLabel?: string;
  reverse?: boolean;
};

export function FeatureShowcase({
  title,
  description,
  imageSrc,
  imageAlt = "",
  href,
  linkLabel = "Learn more",
  reverse = false,
}: FeatureShowcaseProps) {
  return (
    <div
      className={cn(
        "grid items-center gap-8 lg:grid-cols-2 lg:gap-12",
        reverse && "lg:[&>*:first-child]:order-2"
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border/60 shadow-2xl shadow-black/40">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-foreground lg:text-3xl">{title}</h3>
        <p className="mt-4 text-muted leading-relaxed">{description}</p>
        {href && (
          <Link href={href} className="inline-block mt-6">
            <Button variant="secondary">{linkLabel}</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
