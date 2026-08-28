import Image from "next/image";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  title: React.ReactNode;
  subtitle?: string;
  eyebrow?: string;
  imageSrc: string;
  imageAlt?: string;
  align?: "left" | "center";
  tall?: boolean;
  children?: React.ReactNode;
  className?: string;
};

export function PageHero({
  title,
  subtitle,
  eyebrow,
  imageSrc,
  imageAlt = "",
  align = "left",
  tall = true,
  children,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative mt-20 flex w-full items-center overflow-hidden border-b border-border",
        tall ? "min-h-[52vh] lg:min-h-[58vh]" : "min-h-[36vh]",
        className
      )}
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="hero-overlay absolute inset-0" aria-hidden />
      <div className="hero-overlay-accent absolute inset-0" aria-hidden />

      <div
        className={cn(
          "relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:py-28",
          align === "center" && "text-center"
        )}
      >
        <div className={cn("max-w-3xl", align === "center" && "mx-auto")}>
          {eyebrow && (
            <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
              {eyebrow}
            </p>
          )}
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-sm">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-6 text-lg text-white/80 max-w-2xl leading-relaxed drop-shadow-sm">
              {subtitle}
            </p>
          )}
          {children && <div className="mt-10">{children}</div>}
        </div>
      </div>
    </section>
  );
}
