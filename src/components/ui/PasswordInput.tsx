"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label?: string;
  name?: string;
  id?: string;
  required?: boolean;
  minLength?: number;
  defaultValue?: string;
  autoComplete?: "current-password" | "new-password";
  className?: string;
};

export function PasswordInput({
  label = "Password",
  name = "password",
  id,
  required,
  minLength,
  defaultValue,
  autoComplete = "current-password",
  className,
}: Props) {
  const [visible, setVisible] = useState(false);
  const inputId = id || name;

  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <label htmlFor={inputId} className="block text-sm text-muted">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          minLength={minLength}
          defaultValue={defaultValue}
          autoComplete={autoComplete}
          className="w-full rounded-lg border border-border bg-surface py-2.5 pl-3 pr-10 text-foreground placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted transition-colors hover:bg-surface-elevated hover:text-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden />
          ) : (
            <Eye className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}
