import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Field — labelled form control with inline error slot.
 * Labels stay sentence case; errors say how to fix the problem.
 */
export function Field({ label, hint, error, htmlFor, children, className }) {
  return (
    <div className={twMerge(clsx("flex flex-col gap-1.5", className))}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-[13px] font-medium text-ink-700"
        >
          {label}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="text-[12px] leading-snug text-ink-400">{hint}</p>
      )}
      {error && (
        <p
          id={htmlFor ? `${htmlFor}-error` : undefined}
          className="text-[12px] leading-snug text-signal-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ className, invalid, ...props }) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={twMerge(
        clsx("field", invalid && "border-signal-500"),
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, children, invalid, ...props }) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={twMerge(
        clsx("field appearance-none pr-8", invalid && "border-signal-500"),
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M2 4.5 6 8.5 10 4.5' fill='none' stroke='%2355626f' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.55rem center",
        backgroundSize: "12px",
      }}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className, invalid, ...props }) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={twMerge(
        clsx("field resize-y", invalid && "border-signal-500"),
        className,
      )}
      {...props}
    />
  );
}

export default Field;
