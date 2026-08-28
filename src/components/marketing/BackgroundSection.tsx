import Image from "next/image";
import { cn } from "@/lib/utils";

type BackgroundSectionProps = {
  imageSrc?: string;
  imageAlt?: string;
  overlay?: "dark" | "medium" | "light";
  className?: string;
  children: React.ReactNode;
  id?: string;
};

export function BackgroundSection({
  imageSrc,
  imageAlt = "",
  overlay = "dark",
  className,
  children,
  id,
}: BackgroundSectionProps) {
  const overlayClass = {
    dark: "section-overlay-dark",
    medium: "section-overlay-medium",
    light: "section-overlay-light",
  }[overlay];

  return (
    <section id={id} className={cn("relative overflow-hidden", className)}>
      {imageSrc && (
        <>
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover object-center scale-105"
            sizes="100vw"
          />
          <div className={cn("absolute inset-0", overlayClass)} aria-hidden />
        </>
      )}
      <div className="relative z-10">{children}</div>
    </section>
  );
}
