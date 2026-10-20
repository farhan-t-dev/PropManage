import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useNotificationStore } from "../store/notificationStore";

const TONES = {
  success: {
    icon: CheckCircle2,
    className: "border-pine-200 bg-pine-50 text-pine-700",
  },
  error: {
    icon: XCircle,
    className: "border-signal-100 bg-signal-50 text-signal-600",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-brass-200 bg-brass-50 text-brass-600",
  },
  info: {
    icon: Info,
    className: "border-crete-300 bg-crete-50 text-ink-700",
  },
};

export default function Toast() {
  const { isVisible, message, type, hideNotification } = useNotificationStore();
  const tone = TONES[type] || TONES.info;
  const Icon = tone.icon;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-5 sm:justify-end sm:px-6">
      <AnimatePresence>
        {isVisible && message && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-card border px-4 py-3 shadow-lift ${tone.className}`}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p className="flex-1 text-[13.5px] leading-snug">{message}</p>
            <button
              onClick={hideNotification}
              aria-label="Dismiss notification"
              className="-mr-1 shrink-0 rounded-[3px] p-1 opacity-70 transition-opacity hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
