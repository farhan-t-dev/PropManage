import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const VARIANTS = {
  primary:
    "bg-pine-500 text-crete-50 border border-pine-600 hover:bg-pine-600 active:bg-pine-700 shadow-hairline",
  accent:
    "bg-brass-500 text-white border border-brass-600 hover:bg-brass-600 shadow-hairline",
  secondary:
    "bg-crete-50 text-ink-800 border border-crete-300 hover:border-ink-300 hover:bg-white",
  ghost: "text-ink-500 border border-transparent hover:bg-crete-200 hover:text-ink-800",
  console:
    "bg-ink-800 text-crete-100 border border-ink-600 hover:bg-ink-700 hover:border-ink-500",
  danger:
    "bg-signal-500 text-white border border-signal-600 hover:bg-signal-600",
};

const SIZES = {
  sm: "h-8 px-3 text-[13px] gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-[15px] gap-2",
  icon: "h-10 w-10 justify-center",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className,
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={twMerge(
        clsx(
          "inline-flex items-center justify-center rounded-[4px] font-medium",
          "transition-[background-color,border-color,color,transform] duration-150",
          "active:translate-y-px select-none",
          "disabled:opacity-50 disabled:pointer-events-none",
          "whitespace-nowrap",
          VARIANTS[variant],
          SIZES[size],
          className,
        ),
      )}
      {...props}
    >
      {loading && (
        <svg
          className="h-3.5 w-3.5 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeOpacity="0.25"
            strokeWidth="3"
          />
          <path
            d="M12 2a10 10 0 0 1 10 10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
