import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const sizes = {
  sm: 40,
  md: 52,
  lg: 64,
  xl: 80,
} as const;

type LogoProps = {
  size?: keyof typeof sizes;
  showText?: boolean;
  href?: string | null;
  className?: string;
  priority?: boolean;
};

export function Logo({
  size = "md",
  showText = true,
  href = "/",
  className,
  priority = false,
}: LogoProps) {
  const s = sizes[size];

  const content = (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <Image
        src="/logo-icon.png"
        alt="Netzor"
        width={s}
        height={s}
        priority={priority}
        className="h-[var(--logo-h)] w-[var(--logo-h)] object-contain drop-shadow-[0_4px_12px_rgba(0,127,255,0.25)]"
        style={{ "--logo-h": `${s}px` } as React.CSSProperties}
      />
      {showText && (
        <span
          className={cn(
            "gradient-text font-bold tracking-tight",
            size === "sm" && "text-lg",
            size === "md" && "text-2xl",
            size === "lg" && "text-3xl",
            size === "xl" && "text-4xl"
          )}
        >
          Netzor
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
      >
        {content}
      </Link>
    );
  }

  return content;
}
