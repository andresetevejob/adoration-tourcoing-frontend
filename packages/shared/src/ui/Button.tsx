import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";
import { Spinner } from "./Spinner";

export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: "primary" | "outline" | "gold-outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-gold-500 text-night-950 hover:bg-gold-400 focus-visible:outline-gold-500",
  outline: "border border-night-300 text-night-800 hover:bg-night-50 focus-visible:outline-night-500",
  "gold-outline": "border border-gold-500 text-gold-700 hover:bg-gold-50 focus-visible:outline-gold-500",
  ghost: "text-night-700 hover:bg-night-50 focus-visible:outline-night-500",
  danger: "bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled ?? isLoading}
      {...props}
    >
      {isLoading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
