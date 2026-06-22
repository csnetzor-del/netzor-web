import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: Props) {
  const variants = {
    primary:
      "bg-gradient-to-r from-accent to-accent-glow hover:brightness-110 text-white shadow-lg shadow-accent/30",
    secondary:
      "bg-white border border-border hover:border-accent/60 hover:shadow-md text-foreground",
    ghost: "hover:bg-surface-elevated text-muted hover:text-foreground",
    danger: "bg-danger/90 hover:bg-danger text-white",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
