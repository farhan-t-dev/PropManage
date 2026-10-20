import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Inbox, Plus, Wrench, X } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import api from "../api";
import { apiError, formatDate, listOf, money } from "../lib/format";
import {
  PRIORITY_TONES,
  TICKET_TONES,
  statusLabel,
} from "../lib/status";
import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "../store/notificationStore";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import Panel from "../components/ui/Panel";
import Field, { Input, Select, Textarea } from "../components/ui/Field";
import { SkeletonPanel } from "../components/ui/Skeleton";
import StatusTag from "../components/ui/StatusTag";

const CATEGORIES = [
  ["plumbing", "Plumbing"],
  ["electrical", "Electrical"],
  ["hvac", "HVAC"],
  ["appliance", "Appliance"],
  ["structural", "Structural"],
  ["other", "Other"],
];

const PRIORITIES = [
  ["low", "Low"],
  ["medium", "Medium"],
  ["high", "High"],
  ["emergency", "Emergency"],
];

const FILTERS = [
  ["all", "All"],
  ["pending", "Pending"],
  ["in_progress", "In progress"],
  ["resolved", "Resolved"],
];

function NewTicketModal({ open, onClose, onCreated }) {
  const showNotification = useNotificationStore((s) => s.showNotification);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "plumbing",
    priority: "medium",
  });
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [propertyId, setPropertyId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // Residents pick from properties that appear on their own bookings.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const [bookingsRes, unitsRes] = await Promise.all([
          api.get("/bookings/"),
          api.get("/units/"),
        ]);
        if (cancelled) return;
        const bookings = listOf(bookingsRes.data);
        const allUnits = listOf(unitsRes.data);

        // Properties the resident has actually stayed in, keyed by id.
        const byId = new Map();
        bookings.forEach((b) => {
          const u = b.unit_details;
          if (u?.property && !byId.has(u.property)) {
            byId.set(u.property, {
              id: u.property,
              title: u.property_title || `Property ${u.property}`,
            });
          }
        });
        setProperties([...byId.values()]);
        setUnits(allUnits);
      } catch {
        if (!cancelled) setProperties([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setForm({ title: "", description: "", category: "plumbing", priority: "medium" });
      setPropertyId("");
      setUnitId("");
      setError(null);
    }
  }, [open]);

  const unitOptions = useMemo(
    () => units.filter((u) => String(u.property) === String(propertyId)),
    [units, propertyId],
  );

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, property: Number(propertyId) };
      if (unitId) payload.unit = Number(unitId);
      await api.post("/maintenance/requests/", payload);
      showNotification(
        "Ticket filed. The property owner has been notified.",
        "success",
      );
      onCreated?.();
      onClose();
    } catch (err) {
      setError(apiError(err, "The ticket could not be filed."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="File a maintenance ticket"
      subtitle="The property owner is notified the moment you submit."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="new-ticket" loading={saving}>
            File ticket
          </Button>
        </>
      }
    >
      <form id="new-ticket" onSubmit={submit} className="space-y-4">
        <Field label="What needs attention?" htmlFor="ticket_title">
          <Input
            id="ticket_title"
            value={form.title}
            onChange={set("title")}
            placeholder="Leaking pipe under the kitchen sink"
            required
          />
        </Field>

        <Field label="Description" htmlFor="ticket_description">
          <Textarea
            id="ticket_description"
            rows={3}
            value={form.description}
            onChange={set("description")}
            placeholder="Anything the owner should know before sending someone."
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Property" htmlFor="ticket_property">
            <Select
              id="ticket_property"
              value={propertyId}
              onChange={(e) => {
                setPropertyId(e.target.value);
                setUnitId("");
              }}
              required
            >
              <option value="">Select a property</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Unit (optional)" htmlFor="ticket_unit">
            <Select
              id="ticket_unit"
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              disabled={!propertyId}
            >
              <option value="">Whole property</option>
              {unitOptions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.unit_number} — {u.title}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Category" htmlFor="ticket_category">
            <Select
              id="ticket_category"
              value={form.category}
              onChange={set("category")}
            >
              {CATEGORIES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Priority" htmlFor="ticket_priority">
            <Select
              id="ticket_priority"
              value={form.priority}
              onChange={set("priority")}
            >
              {PRIORITIES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-[4px] border border-signal-100 bg-signal-50 px-3 py-2.5 text-[13px] text-signal-600"
          >
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}

function ResolveModal({ ticket, onClose, onResolved }) {
  const showNotification = useNotificationStore((s) => s.showNotification);
  const [cost, setCost] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!cost || Number(cost) <= 0) {
      setError("A resolved ticket must carry a cost greater than zero.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.post(`/maintenance/requests/${ticket.id}/resolve/`, { cost });
      showNotification(`Ticket #${ticket.id} resolved.`, "success");
      onResolved?.();
      onClose();
    } catch (err) {
      setError(apiError(err, "The ticket could not be resolved."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={!!ticket}
      onClose={onClose}
      title={`Resolve ticket #${ticket?.id}`}
      subtitle={ticket?.title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="resolve-ticket" loading={saving}>
            Mark resolved
          </Button>
        </>
      }
    >
      <form id="resolve-ticket" onSubmit={submit} className="space-y-4">
        <p className="text-[13.5px] leading-relaxed text-ink-500">
          The state machine requires a cost before a ticket can close, so every
          resolution carries a number on the ledger.
        </p>
        <Field
          label="Final cost"
          htmlFor="resolve_cost"
          hint="Charged to the property owner's ledger."
          error={error}
        >
          <div className="relative">
            <span className="num pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
              $
            </span>
            <Input
              id="resolve_cost"
              type="number"
              step="0.01"
              min="0.01"
              value={cost}
              onChange={(e) => {
                setCost(e.target.value);
                setError(null);
              }}
              placeholder="0.00"
              className="pl-7"
              invalid={!!error}
              required
            />
          </div>
        </Field>
      </form>
    </Modal>
  );
}

export default function MaintenanceView() {
  const { user, isAuthenticated } = useAuthStore();
  const showNotification = useNotificationStore((s) => s.showNotification);
  const isLandlord = user?.role === "landlord" || user?.role === "admin";

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showNew, setShowNew] = useState(false);
  const [resolving, setResolving] = useState(null);
  const [actionId, setActionId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/maintenance/requests/");
      setRequests(listOf(res.data));
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function startWork(id) {
    setActionId(id);
    try {
      await api.post(`/maintenance/requests/${id}/start_work/`);
      showNotification("Work started. The resident has been told.", "success");
      await load();
    } catch (err) {
      showNotification(apiError(err, "Could not start work."), "error");
    } finally {
      setActionId(null);
    }
  }

  const counts = useMemo(() => {
    const c = { all: requests.length };
    ["pending", "in_progress", "resolved", "cancelled"].forEach((s) => {
      c[s] = requests.filter((r) => r.status === s).length;
    });
    return c;
  }, [requests]);

  const visible = useMemo(() => {
    if (filter === "all") return requests;
    return requests.filter((r) => r.status === filter);
  }, [requests, filter]);

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonPanel rows={3} />
        <SkeletonPanel rows={2} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="display text-[28px] font-semibold text-ink-900">
            Maintenance desk
          </h2>
          <p className="mt-1 text-[14px] text-ink-400">
            {isLandlord
              ? "Work the queue: start jobs, close them with a cost."
              : "File faults and watch their progress in real time."}
          </p>
        </div>

        {!isLandlord && isAuthenticated && (
          <Button onClick={() => setShowNew(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New ticket
          </Button>
        )}
      </div>

      {!isAuthenticated && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-brass-200 bg-brass-50 px-5 py-4">
          <p className="text-[13.5px] text-brass-600">
            Sign in to file tickets or work the queue.
          </p>
          <Link to="/login">
            <Button variant="accent" size="sm">
              Sign in
            </Button>
          </Link>
        </div>
      )}

      {/* Filters — segmented control, counts included */}
      <div className="flex flex-wrap gap-1 rounded-card border border-crete-300 bg-crete-50 p-1 shadow-hairline">
        {FILTERS.map(([value, label]) => {
          const active = filter === value;
          return (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={twMerge(
                clsx(
                  "flex items-center gap-2 rounded-[3px] px-3.5 py-1.5 text-[13px] transition-colors",
                  active
                    ? "bg-ink-800 font-medium text-crete-50"
                    : "text-ink-500 hover:bg-crete-200 hover:text-ink-800",
                ),
              )}
            >
              {label}
              <span
                className={clsx(
                  "num text-[11.5px]",
                  active ? "text-brass-400" : "text-ink-300",
                )}
              >
                {counts[value] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-card border border-crete-300 bg-crete-50">
          <EmptyState
            icon={filter === "all" ? Inbox : Wrench}
            title={
              filter === "all"
                ? "The queue is empty"
                : `No ${statusLabel(filter).toLowerCase()} tickets`
            }
            description={
              filter === "all"
                ? "Tickets raised by residents appear here and push a notification the moment they land."
                : "Switch filters to see the rest of the queue."
            }
            action={
              !isLandlord && isAuthenticated && filter === "all" ? (
                <Button variant="secondary" size="sm" onClick={() => setShowNew(true)}>
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  File a ticket
                </Button>
              ) : null
            }
          />
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((ticket) => {
            const urgent =
              ticket.priority === "high" || ticket.priority === "emergency";
            return (
              <li
                key={ticket.id}
                className={twMerge(
                  clsx(
                    "overflow-hidden rounded-card border bg-crete-50 shadow-hairline",
                    urgent ? "border-brass-200" : "border-crete-300",
                  ),
                )}
              >
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
                  {/* Priority rail — the one place colour leads */}
                  <span
                    className={clsx(
                      "hidden w-1 shrink-0 self-stretch rounded-full sm:block",
                      ticket.priority === "emergency"
                        ? "bg-signal-500"
                        : ticket.priority === "high"
                          ? "bg-brass-500"
                          : ticket.priority === "medium"
                            ? "bg-amber-500"
                            : "bg-crete-300",
                    )}
                    aria-hidden="true"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="num text-[12px] text-ink-300">
                        #{ticket.id}
                      </span>
                      <StatusTag tone={PRIORITY_TONES[ticket.priority] || "ink"}>
                        {statusLabel(ticket.priority)}
                      </StatusTag>
                      <StatusTag tone={TICKET_TONES[ticket.status] || "ink"}>
                        {statusLabel(ticket.status)}
                      </StatusTag>
                      {urgent && ticket.status !== "resolved" && (
                        <span className="flex items-center gap-1 text-[12px] font-medium text-signal-600">
                          <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                          action required
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 text-[16px] font-semibold text-ink-900">
                      {ticket.title}
                    </h3>
                    {ticket.description && (
                      <p className="mt-1 max-w-[70ch] text-[13.5px] leading-relaxed text-ink-500">
                        {ticket.description}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12.5px] text-ink-400">
                      <span className="num">filed {formatDate(ticket.created_at)}</span>
                      <span>{statusLabel(ticket.category)}</span>
                      {ticket.cost != null && (
                        <span className="num font-medium text-ink-700">
                          cost {money(ticket.cost, { decimals: true })}
                        </span>
                      )}
                      {ticket.resolved_at && (
                        <span className="num">
                          closed {formatDate(ticket.resolved_at)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* FSM transitions, scoped by role */}
                  {isLandlord && (
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {ticket.status === "pending" && (
                        <Button
                          size="sm"
                          loading={actionId === ticket.id}
                          onClick={() => startWork(ticket.id)}
                        >
                          Start work
                        </Button>
                      )}
                      {ticket.status === "in_progress" && (
                        <Button
                          size="sm"
                          variant="accent"
                          onClick={() => setResolving(ticket)}
                        >
                          Resolve…
                        </Button>
                      )}
                      {(ticket.status === "pending" ||
                        ticket.status === "in_progress") && (
                        <span className="self-center text-[12px] text-ink-300">
                          {ticket.status === "in_progress"
                            ? "cost required to close"
                            : "not started"}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <NewTicketModal
        open={showNew}
        onClose={() => setShowNew(false)}
        onCreated={load}
      />
      <ResolveModal
        ticket={resolving}
        onClose={() => setResolving(null)}
        onResolved={load}
      />
    </div>
  );
}
