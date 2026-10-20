import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, CreditCard, LayoutGrid, Wrench } from "lucide-react";
import api from "../api";
import {
  apiError,
  formatDate,
  formatDateShort,
  listOf,
  money,
  nightsBetween,
} from "../lib/format";
import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "../store/notificationStore";
import {
  BOOKING_TONES,
  INVOICE_TONES,
  TICKET_TONES,
  statusLabel,
} from "../lib/status";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Panel from "../components/ui/Panel";
import StatStrip from "../components/ui/StatStrip";
import { SkeletonPanel } from "../components/ui/Skeleton";
import StatusTag from "../components/ui/StatusTag";

export default function TenantDashboard() {
  const { user } = useAuthStore();
  const showNotification = useNotificationStore((s) => s.showNotification);

  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [b, m] = await Promise.allSettled([
      api.get("/bookings/"),
      api.get("/maintenance/requests/"),
    ]);
    setBookings(b.status === "fulfilled" ? listOf(b.value.data) : []);
    setTickets(m.status === "fulfilled" ? listOf(m.value.data) : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const active = bookings.filter((b) => b.status === "confirmed");
    const outstanding = bookings.reduce((sum, b) => {
      const invoice = b.invoice;
      return invoice && invoice.status !== "paid"
        ? sum + (Number(invoice.amount) || 0)
        : sum;
    }, 0);
    const openTickets = tickets.filter(
      (t) => t.status === "pending" || t.status === "in_progress",
    ).length;

    return [
      {
        label: "Confirmed stays",
        value: active.length,
        note: `${bookings.length} booking${bookings.length === 1 ? "" : "s"} total`,
        tone: "pine",
      },
      {
        label: "Outstanding balance",
        value: money(outstanding, { decimals: true }),
        note: outstanding > 0 ? "settle below" : "nothing owed",
        tone: outstanding > 0 ? "brass" : "ink",
      },
      {
        label: "Open tickets",
        value: openTickets,
        note: openTickets > 0 ? "being worked" : "all clear",
        tone: openTickets > 0 ? "brass" : "ink",
      },
    ];
  }, [bookings, tickets]);

  async function payInvoice(invoiceId) {
    setPayingId(invoiceId);
    try {
      await api.post(`/billing/invoices/${invoiceId}/pay/`);
      showNotification("Invoice settled. The payment is on the ledger.", "success");
      await load();
    } catch (err) {
      showNotification(apiError(err, "Payment could not be processed."), "error");
    } finally {
      setPayingId(null);
    }
  }

  async function cancelBooking(bookingId) {
    setCancellingId(bookingId);
    try {
      await api.post(`/bookings/${bookingId}/cancel/`);
      showNotification("Booking cancelled.", "warning");
      await load();
    } catch (err) {
      showNotification(apiError(err, "The booking could not be cancelled."), "error");
    } finally {
      setCancellingId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonPanel rows={3} />
        <SkeletonPanel rows={3} />
      </div>
    );
  }

  const sorted = [...bookings].sort(
    (a, b) => new Date(b.start_date) - new Date(a.start_date),
  );
  const myTickets = tickets.slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="display text-[28px] font-semibold text-ink-900">
            Welcome back, {user?.first_name || user?.username}.
          </h2>
          <p className="mt-1 text-[14px] text-ink-400">
            Your stays, invoices and open tickets in one place.
          </p>
        </div>
        <Link to="/discover">
          <Button>
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            Book a new stay
          </Button>
        </Link>
      </div>

      <StatStrip stats={stats} />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Reservations */}
        <Panel
          title="Reservations"
          subtitle="Confirmed and historical stays"
          padding="p-0"
        >
          {sorted.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No reservations yet"
              description="Browse the inventory and reserve a unit — it lands here the moment you book."
              action={
                <Link to="/discover">
                  <Button variant="secondary" size="sm">
                    Browse units
                  </Button>
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-crete-200">
              {sorted.map((booking) => {
                const invoice = booking.invoice;
                const nights = nightsBetween(
                  booking.start_date,
                  booking.end_date,
                );
                const canCancel =
                  booking.status === "pending" || booking.status === "confirmed";

                return (
                  <li key={booking.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-semibold text-ink-900">
                          {booking.unit_details?.title || "Unit"}
                          <span className="num ml-2 text-[12.5px] font-normal text-ink-400">
                            {booking.unit_details?.unit_number}
                          </span>
                        </p>
                        <p className="truncate text-[13px] text-ink-400">
                          {booking.unit_details?.property_title}
                        </p>
                      </div>
                      <StatusTag tone={BOOKING_TONES[booking.status] || "ink"}>
                        {statusLabel(booking.status)}
                      </StatusTag>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px]">
                      <span className="num text-ink-500">
                        {formatDateShort(booking.start_date)} →{" "}
                        {formatDateShort(booking.end_date)}
                      </span>
                      <span className="text-ink-400">
                        {nights} night{nights === 1 ? "" : "s"}
                      </span>
                      <span className="num font-medium text-ink-800">
                        {money(booking.total_price, { decimals: true })}
                      </span>
                      {invoice && (
                        <StatusTag
                          tone={INVOICE_TONES[invoice.status] || "ink"}
                          className="ml-auto"
                        >
                          invoice {statusLabel(invoice.status)}
                        </StatusTag>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {invoice && invoice.status !== "paid" && (
                        <Button
                          size="sm"
                          loading={payingId === invoice.id}
                          onClick={() => payInvoice(invoice.id)}
                        >
                          <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
                          Pay {money(invoice.amount, { decimals: true })}
                        </Button>
                      )}
                      {canCancel && (
                        <Button
                          size="sm"
                          variant="ghost"
                          loading={cancellingId === booking.id}
                          onClick={() => cancelBooking(booking.id)}
                        >
                          Cancel booking
                        </Button>
                      )}
                      <span className="num ml-auto text-[12px] text-ink-300">
                        booked {formatDate(booking.created_at)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        {/* Tickets */}
        <Panel
          title="Maintenance"
          subtitle="Tickets you have filed"
          padding="p-0"
          action={
            <Link to="/maintenance">
              <Button variant="secondary" size="sm">
                Open desk
              </Button>
            </Link>
          }
        >
          {myTickets.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No tickets filed"
              description="Report a fault from the maintenance desk and the landlord is notified instantly."
              compact
              action={
                <Link to="/maintenance">
                  <Button variant="secondary" size="sm">
                    File a ticket
                  </Button>
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-crete-200">
              {myTickets.map((ticket) => (
                <li key={ticket.id} className="px-5 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-medium text-ink-800">
                        {ticket.title}
                      </p>
                      <p className="num mt-0.5 text-[12px] text-ink-300">
                        {formatDate(ticket.created_at)}
                        {ticket.cost != null &&
                          ` · ${money(ticket.cost, { decimals: true })}`}
                      </p>
                    </div>
                    <StatusTag tone={TICKET_TONES[ticket.status] || "ink"}>
                      {statusLabel(ticket.status)}
                    </StatusTag>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
