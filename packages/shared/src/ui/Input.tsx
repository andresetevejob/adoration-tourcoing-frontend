import { forwardRef, useId, useState, type ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";

export interface InputProps extends ComponentPropsWithoutRef<"input"> {
  label?: string;
  error?: string;
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M9.9 4.24A11.6 11.6 0 0 1 12 4c7 0 11 7 11 7a13.2 13.2 0 0 1-3.15 3.84M6.6 6.6C3.9 8.24 2 11 2 11s4 7 11 7a11.6 11.6 0 0 0 4.24-.79"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className, type, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (visible ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-night-800">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          aria-invalid={Boolean(error)}
          className={cn(
            "w-full rounded-md border border-pearl-dark bg-white px-3 py-2 text-night-900 placeholder:text-night-400",
            "focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200",
            error && "border-red-500 focus:border-red-500 focus:ring-red-200",
            className,
            isPassword && "pr-10",
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => {
              setVisible((current) => !current);
            }}
            aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-night-400 hover:text-night-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 focus-visible:text-gold-500"
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
});
