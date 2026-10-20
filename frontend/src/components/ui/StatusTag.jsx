import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * StatusTag — domain status vocabulary, colour-coded by meaning.
 * Pine = settled/confirmed, brass = needs you, signal = blocked/cancelled,
 * ink = inert. The tone maps live in lib/status.js so fast-refresh stays intact.
 */
const TONES = {
  pine: "bg-pine-50 text-pine-600 border-pine-200",
  brass: "bg-brass-50 text-brass-600 border-brass-200",
  signal: "bg-signal-50 text-signal-600 border-signal-100",
  amber: "bg-amber-50 text-amber-600 border-amber-100",
  ink: "bg-crete-200 text-ink-500 border-crete-300",
  console: "bg-ink-700 text-crete-200 border-ink-600",
};

const DOTS = {
  pine: "bg-pine-500",
  brass: "bg-brass-500",
  signal: "bg-signal-500",
  amber: "bg-amber-500",
  ink: "bg-ink-300",
  console: "bg-brass-400",
};

export default function StatusTag({
  tone = "ink",
  dot = true,
  className,
  children,
}) {
  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center gap-1.5 rounded-[3px] border px-2 py-0.5",
          "text-[12px] font-medium leading-5 whitespace-nowrap",
          TONES[tone] || TONES.ink,
          className,
        ),
      )}
    >
      {dot && (
        <span
          className={clsx(
            "h-1.5 w-1.5 rounded-full",
            DOTS[tone] || DOTS.ink,
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
