/**
 * Domain status vocabulary, kept separate from components so that
 * react-refresh's fast-refresh boundary stays intact (a file that mixes
 * components and plain constants disables HMR for that module).
 */

/** Colour tone per status — meaning-driven, never decorative. */
export const BOOKING_TONES = {
  pending: "brass",
  confirmed: "pine",
  completed: "ink",
  cancelled: "signal",
};

export const INVOICE_TONES = {
  pending: "brass",
  paid: "pine",
  overdue: "signal",
  cancelled: "ink",
};

export const TICKET_TONES = {
  pending: "brass",
  in_progress: "amber",
  resolved: "pine",
  cancelled: "signal",
};

export const PRIORITY_TONES = {
  low: "ink",
  medium: "amber",
  high: "brass",
  emergency: "signal",
};

export const PAYOUT_TONES = {
  pending: "brass",
  processed: "pine",
};

/** "in_progress" -> "In Progress" */
export function statusLabel(value) {
  if (!value) return "";
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export const ROLE_HOME = {
  landlord: "/landlord-dashboard",
  admin: "/landlord-dashboard",
  tenant: "/my-bookings",
};

/** Route a given user lands on after login or a guard bounce. */
export function homeFor(user) {
  return ROLE_HOME[user?.role] || "/";
}
