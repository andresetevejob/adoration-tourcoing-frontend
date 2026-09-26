import type { ReactNode } from "react";
import { cn } from "../utils/cn";

export interface BadgeProps {
  variant: "success" | "warning" | "danger" | "info" | "neutral";
  children: ReactNode;
}

const variantClasses: Record<BadgeProps["variant"], string> = {
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-gold-100 text-gold-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-night-100 text-night-800",
  neutral: "bg-pearl text-night-700",
};

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
      )}
    >
      {children}
    </span>
  );
}
