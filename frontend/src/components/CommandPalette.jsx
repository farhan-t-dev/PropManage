import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, MapPin, Search, User, CornerDownLeft } from "lucide-react";
import api from "../api";
import { useAuthStore } from "../store/authStore";

const TYPE_ICON = {
  property: Building2,
  unit: MapPin,
  tenant: User,
};

/**
 * Command palette (⌘K). Debounced server-side search across properties,
 * units and tenants. Requires an authenticated session.
 */
export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open || !isAuthenticated) return;
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await api.get("/search/", { params: { q: query.trim() } });
        setResults(Array.isArray(res.data) ? res.data : []);
        setActive(0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 260);
    return () => clearTimeout(t);
  }, [query, open, isAuthenticated]);

  const grouped = useMemo(() => {
    const order = ["property", "unit", "tenant"];
    return order
      .map((type) => ({
        type,
        items: results.filter((r) => r.type === type),
      }))
      .filter((g) => g.items.length > 0);
  }, [results]);

  const flat = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  const onKey = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (flat.length ? (i + 1) % flat.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (flat.length ? (i - 1 + flat.length) % flat.length : 0));
    } else if (e.key === "Enter" && flat[active]) {
      e.preventDefault();
      window.location.assign(flat[active].url);
      onClose();
    }
  };

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]">
          <motion.div
            className="fixed inset-0 bg-ink-950/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-card border border-ink-600 bg-ink-800 shadow-lift"
            initial={{ opacity: 0, y: -10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onKeyDown={onKey}
          >
            <div className="flex items-center gap-3 border-b border-ink-700 px-4">
              <Search className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  isAuthenticated
                    ? "Search properties, units, tenants…"
                    : "Sign in to search"
                }
                disabled={!isAuthenticated}
                className="h-12 w-full bg-transparent text-[15px] text-crete-100 outline-none placeholder:text-ink-400 disabled:cursor-not-allowed"
              />
              {loading && (
                <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-ink-600 border-t-brass-400" />
              )}
            </div>

            <div ref={listRef} className="max-h-[22rem] overflow-y-auto py-1.5">
              {query.trim().length < 2 ? (
                <p className="px-4 py-8 text-center text-[13px] text-ink-400">
                  Type at least two characters to search the portfolio.
                </p>
              ) : flat.length === 0 && !loading ? (
                <p className="px-4 py-8 text-center text-[13px] text-ink-400">
                  Nothing matches “{query}”.
                </p>
              ) : (
                grouped.map((group) => (
                  <div key={group.type}>
                    <h3 className="px-4 pb-1 pt-2.5 text-[11px] font-medium text-ink-400">
                      {group.type === "property"
                        ? "Properties"
                        : group.type === "unit"
                          ? "Units"
                          : "Tenants"}
                    </h3>
                    {group.items.map((item) => {
                      const idx = flat.indexOf(item);
                      const Icon = TYPE_ICON[item.type] || Search;
                      const isActive = idx === active;
                      return (
                        <button
                          key={`${item.type}-${item.id}`}
                          data-idx={idx}
                          onMouseEnter={() => setActive(idx)}
                          onClick={() => {
                            window.location.assign(item.url);
                            onClose();
                          }}
                          className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            isActive ? "bg-ink-700" : ""
                          }`}
                        >
                          <Icon
                            className={`h-4 w-4 shrink-0 ${
                              isActive ? "text-brass-400" : "text-ink-400"
                            }`}
                            strokeWidth={1.8}
                            aria-hidden="true"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[14px] text-crete-100">
                              {item.title}
                            </span>
                            {item.subtitle && (
                              <span className="block truncate text-[12px] text-ink-400">
                                {item.subtitle}
                              </span>
                            )}
                          </span>
                          {isActive && (
                            <CornerDownLeft
                              className="h-3.5 w-3.5 shrink-0 text-ink-400"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
