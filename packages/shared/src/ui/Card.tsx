import type { ReactNode } from "react";
import { cn } from "../utils/cn";

export interface CardProps {
  title?: string;
  className?: string;
  children: ReactNode;
}

export function Card({ title, className, children }: CardProps) {
  return (
    <div className={cn("rounded-lg border border-pearl bg-white p-6 shadow-sm", className)}>
      {title && <h3 className="mb-4 font-serif text-lg font-semibold text-night-900">{title}</h3>}
      {children}
    </div>
  );
}
