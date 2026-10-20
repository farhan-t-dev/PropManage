import Button from "./Button";

/**
 * EmptyState — an empty screen is a moment for direction, not decoration.
 * Always says what is missing and what to do about it.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  compact = false,
}) {
  return (
    <div
      className={
        compact
          ? "flex flex-col items-center gap-2 px-6 py-10 text-center"
          : "flex flex-col items-center gap-3 px-6 py-14 text-center"
      }
    >
      {Icon && (
        <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-card border border-crete-300 bg-crete-100 text-ink-400">
          <Icon className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
        </div>
      )}
      <h3 className="text-[15px] font-semibold text-ink-800">{title}</h3>
      {description && (
        <p className="max-w-sm text-[13px] leading-relaxed text-ink-400">
          {description}
        </p>
      )}
      {action ??
        (actionLabel && (
          <Button variant="secondary" size="sm" onClick={onAction} className="mt-1">
            {actionLabel}
          </Button>
        ))}
    </div>
  );
}
