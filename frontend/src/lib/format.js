/**
 * Presentation helpers. Money is always tabular so ledger columns line up;
 * dates are rendered in the plan-set style (12 Mar 2026).
 */

export function money(value, { decimals = false } = {}) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  }).format(n);
}

export function moneyCompact(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 10000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(n);
  }
  return money(n);
}

export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateShort(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return `${formatDate(d)} · ${d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function nightsBetween(start, end) {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0;
  const diff = Math.round((e - s) / 86400000);
  return diff > 0 ? diff : 0;
}

/** DRF paginators return {results}; custom actions return bare arrays. */
export function listOf(data) {
  if (Array.isArray(data)) return data;
  return data?.results || [];
}

export function initials(user) {
  if (!user) return "—";
  const a = user.first_name?.trim();
  const b = user.last_name?.trim();
  if (a || b) return `${a?.[0] || ""}${b?.[0] || ""}`.toUpperCase();
  return (user.username || "?").slice(0, 2).toUpperCase();
}

export function displayName(user) {
  if (!user) return "Guest";
  const name = `${user.first_name || ""} ${user.last_name || ""}`.trim();
  return name || user.username;
}

/**
 * Flatten axios / DRF error bodies into a single readable message.
 * Handles {"detail": "..."}, {"field": ["..."]}, and bare JSON arrays.
 */
export function apiError(err, fallback = "Something went wrong.") {
  const data = err?.response?.data;
  if (!data) return err?.message || fallback;
  if (typeof data === "string") return data;
  if (Array.isArray(data)) return data.filter(Boolean).join(" ");
  if (data.detail) return data.detail;
  if (data.error) return data.error;
  const first = Object.entries(data).find(([, v]) => v);
  if (first) {
    const [key, value] = first;
    const msg = Array.isArray(value) ? value[0] : value;
    return `${key.replace(/_/g, " ")}: ${msg}`;
  }
  return fallback;
}

/** Pull one field's error out of a DRF validation response. */
export function fieldError(err, field) {
  const data = err?.response?.data;
  if (!data || Array.isArray(data) || typeof data === "string") return null;
  const v = data[field];
  if (!v) return null;
  return Array.isArray(v) ? v[0] : v;
}

export function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}
