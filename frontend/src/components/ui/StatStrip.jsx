import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * StatStrip — a single panel divided by hairlines rather than three
 * identical cards. Big tabular figures, quiet labels underneath.
 */
export function Stat({ label, value, note, tone = "ink", align = "left" }) {
  const valueTone = {
    ink: "text-ink-900",
    pine: "text-pine-600",
    brass: "text-brass-600",
    signal: "text-signal-600",
  }[tone];

  return (
    <div
      className={twMerge(
        "flex-1 px-5 py-4",
        align === "right" && "text-right",
      )}
    >
      <div className="text-[12px] font-medium tracking-wide text-ink-400">
        {label}
      </div>
      <div
        className={twMerge(
          "num mt-1.5 text-[26px] font-medium leading-none tracking-tight",
          valueTone,
        )}
      >
        {value}
      </div>
      {note && (
        <div className="mt-1.5 text-[12px] leading-snug text-ink-400">
          {note}
        </div>
      )}
    </div>
  );
}

export default function StatStrip({ stats, className }) {
  return (
    <div
      className={twMerge(
        clsx(
          "flex flex-wrap divide-x divide-crete-200 rounded-card border",
          "border-crete-300 bg-crete-50 shadow-hairline",
          className,
        ),
      )}
    >
      {stats.map((stat) => (
        <Stat key={stat.label} {...stat} />
      ))}
    </div>
  );
}
