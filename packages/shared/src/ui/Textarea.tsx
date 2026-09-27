import { forwardRef, useId, type ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";

export interface TextareaProps extends ComponentPropsWithoutRef<"textarea"> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, id, className, rows = 6, ...props },
  ref,
) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-night-800">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        aria-invalid={Boolean(error)}
        className={cn(
          "rounded-md border border-pearl-dark bg-white px-3 py-2 text-night-900 placeholder:text-night-400",
          "focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200",
          error && "border-red-500 focus:border-red-500 focus:ring-red-200",
          className,
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
});
