import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const heights = {
  sm: 44,
  md: 56,
  lg: 72,
  xl: 96,
} as const;

type LogoProps = {
  size?: keyof typeof heights;
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
  const h = heights[size];

  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/logo-icon.png"
        alt="Netzor"
        width={Math.round(h * 2.6)}
        height={h}
        priority={priority}
        className="h-[var(--logo-h)] w-auto max-w-[calc(var(--logo-h)*3)] object-contain object-left"
        style={{ "--logo-h": `${h}px` } as React.CSSProperties}
      />
      {showText && (
        <span
          className={cn(
            "gradient-text font-semibold tracking-tight",
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
      <Link href={href} className="shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
}
