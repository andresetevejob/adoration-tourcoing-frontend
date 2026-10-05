import { forwardRef, useId, type ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";

export interface FileInputProps extends Omit<ComponentPropsWithoutRef<"input">, "type"> {
  label?: string;
  error?: string;
}

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(function FileInput(
  { label, error, id, className, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-night-800">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type="file"
        aria-invalid={Boolean(error)}
        className={cn(
          "w-full rounded-md border border-pearl-dark bg-white text-sm text-night-900",
          "file:mr-3 file:rounded-md file:border-0 file:bg-gold-500 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white file:hover:bg-gold-600",
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
