import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Panel — the plan-sheet container. Hairline borders, no soft shadows.
 * A panel may carry a title bar; the bar is divided from the body by a rule,
 * never by whitespace alone.
 */
export default function Panel({
  title,
  subtitle,
  action,
  padding = "p-5",
  className,
  bodyClassName,
  children,
  as: Tag = "section",
  ...props
}) {
  return (
    <Tag
      className={twMerge(
        clsx(
          "rounded-card border border-crete-300 bg-crete-50 shadow-hairline",
          className,
        ),
      )}
      {...props}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 border-b border-crete-200 px-5 py-3.5">
          <div className="min-w-0">
            {title && (
              <h2 className="text-[15px] font-semibold text-ink-900">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-[13px] leading-snug text-ink-400">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={twMerge(clsx(padding), bodyClassName)}>{children}</div>
    </Tag>
  );
}
