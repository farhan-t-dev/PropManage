import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  Building2,
  CheckCircle2,
  Download,
  Plus,
  Wallet,
  Wrench,
} from "lucide-react";
import api, { apiUrl } from "../api";
import { formatDateShort, listOf, money, moneyCompact } from "../lib/format";
import { BOOKING_TONES, statusLabel } from "../lib/status";
import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "../store/notificationStore";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Panel from "../components/ui/Panel";
import StatStrip from "../components/ui/StatStrip";
import { SkeletonPanel } from "../components/ui/Skeleton";
import StatusTag from "../components/ui/StatusTag";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
);

const INK = "#55626f";
const HAIRLINE = "#e7e7e2";

export default function LandlordDashboard() {
  const { user } = useAuthStore();
  const showNotification = useNotificationStore((s) => s.showNotification);

  const [bookings, setBookings] = useState([]);
  const [units, setUnits] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [ledger, setLedger] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [b, u, r, l, m] = await Promise.allSettled([
      api.get("/bookings/my_properties_bookings/"),
      api.get("/units/"),
      api.get("/bookings/monthly_revenue/"),
      api.get("/billing/invoices/landlord_ledger/"),
      api.get("/maintenance/requests/"),
    ]);
    setBookings(b.status === "fulfilled" ? listOf(b.value.data) : []);
    setUnits(u.status === "fulfilled" ? listOf(u.value.data) : []);
    setRevenue(r.status === "fulfilled" ? r.value.data : []);
    setLedger(l.status === "fulfilled" ? l.value.data : null);
    setTickets(m.status === "fulfilled" ? listOf(m.value.data) : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    // Occupancy counts units that are currently confirmed OR have hosted a
    // completed stay — the seeded ledger is all historical bookings, so only
    // counting "confirmed" would misleadingly report 0% for a full portfolio.
    const occupiedUnitIds = new Set(
      bookings
        .filter((b) => b.status === "confirmed" || b.status === "completed")
        .map((b) => b.unit_details?.id ?? b.unit),
    );
    const occupancy = units.length
      ? Math.round((occupiedUnitIds.size / units.length) * 100)
      : 0;
    const openTickets = tickets.filter(
      (t) => t.status === "pending" || t.status === "in_progress",
    ).length;
    const pending = bookings.filter((b) => b.status === "pending").length;

    return [
      {
        label: "Ledger balance",
        value: money(ledger?.balance ?? 0, { decimals: true }),
        note: "net payouts recorded",
        tone: "pine",
      },
      {
        label: "Occupancy",
        value: `${occupancy}%`,
        note: `${occupiedUnitIds.size} of ${units.length} units booked`,
        tone: occupancy >= 50 ? "pine" : "brass",
      },
      {
        label: "Awaiting confirmation",
        value: pending,
        note: pending > 0 ? "review below" : "nothing pending",
        tone: pending > 0 ? "brass" : "ink",
      },
      {
        label: "Open tickets",
        value: openTickets,
        note: openTickets > 0 ? "action required" : "all clear",
        tone: openTickets > 0 ? "signal" : "ink",
      },
    ];
  }, [bookings, units, ledger, tickets]);

  async function confirmBooking(id) {
    setConfirmingId(id);
    try {
      await api.post(`/bookings/${id}/confirm/`);
      showNotification(
        "Booking confirmed. An invoice has been queued for generation.",
        "success",
      );
      await load();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        "This booking could not be confirmed from its current status.";
      showNotification(msg, "error");
      await load();
    } finally {
      setConfirmingId(null);
    }
  }

  async function exportCsv() {
    setExporting(true);
    try {
      const res = await api.get("/bookings/download_bookings_csv/", {
        responseType: "blob",
        skipAuthReset: true,
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bookings_report.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showNotification("Bookings report exported.", "success");
    } catch (err) {
      // Fall back to a plain link if the browser blocks the programmatic download.
      if (err?.config?.responseType === "blob") {
        window.open(apiUrl("/bookings/download_bookings_csv/"), "_blank");
      } else {
        showNotification("Export failed.", "error");
      }
    } finally {
      setExporting(false);
    }
  }

  const recent = useMemo(
    () =>
      [...bookings]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 6),
    [bookings],
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonPanel rows={4} />
        <SkeletonPanel rows={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="display text-[28px] font-semibold text-ink-900">
            Portfolio overview
          </h2>
          <p className="mt-1 text-[14px] text-ink-400">
            {user?.first_name ? `${user.first_name}, y` : "Y"}our ledger,
            occupancy and reservations at a glance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={exportCsv} loading={exporting}>
            <Download className="h-4 w-4" aria-hidden="true" />
            Export CSV
          </Button>
          <Link to="/landlord-dashboard/create-property">
            <Button>
              <Plus className="h-4 w-4" aria-hidden="true" />
              New property
            </Button>
          </Link>
        </div>
      </div>

      <StatStrip stats={stats} />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Revenue chart */}
        <Panel
          title="Monthly revenue"
          subtitle="Settled invoices, by stay month"
          action={
            revenue.length > 0 && (
              <span className="flex items-center gap-3 text-[12px] text-ink-400">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-[1px] bg-brass-500" aria-hidden="true" />
                  latest
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-[1px] bg-pine-500" aria-hidden="true" />
                  prior
                </span>
              </span>
            )
          }
        >
          {revenue.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="No settled revenue yet"
              description="Revenue appears here once you confirm a booking and the resident pays the invoice."
              compact
            />
          ) : (
            <div className="h-64">
              <Bar
                data={{
                  labels: revenue.map((r) => r.label),
                  datasets: [
                    {
                      label: "Revenue",
                      data: revenue.map((r) => Number(r.revenue) || 0),
                      backgroundColor: revenue.map((r, i) =>
                        // Brass marks the most recent month — the figure that
                        // needs attention. Tied values no longer flood brass.
                        i === revenue.length - 1 ? "#be7b2a" : "#0e6b58",
                      ),
                      hoverBackgroundColor: "#0a5344",
                      borderRadius: 2,
                      maxBarSize: 44,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: "#161c22",
                      titleColor: "#aab4be",
                      bodyColor: "#fafaf8",
                      titleFont: { family: "Archivo", size: 12 },
                      bodyFont: {
                        family: "IBM Plex Mono",
                        size: 13,
                        weight: "500",
                      },
                      padding: 10,
                      cornerRadius: 4,
                      displayColors: false,
                      callbacks: {
                        label: (ctx) => money(ctx.parsed.y, { decimals: true }),
                      },
                    },
                  },
                  scales: {
                    x: {
                      grid: { display: false },
                      border: { color: HAIRLINE },
                      ticks: {
                        color: INK,
                        font: { family: "IBM Plex Mono", size: 11 },
                        maxRotation: 0,
                        autoSkipPadding: 12,
                      },
                    },
                    y: {
                      grid: { color: HAIRLINE },
                      border: { display: false },
                      ticks: {
                        color: INK,
                        font: { family: "IBM Plex Mono", size: 11 },
                        callback: (value) => moneyCompact(value),
                        maxTicksLimit: 5,
                      },
                    },
                  },
                }}
              />
            </div>
          )}
        </Panel>

        {/* Ledger */}
        <Panel
          title="Payout ledger"
          subtitle="Recent transactions"
          padding="p-0"
        >
          {!ledger?.recent_transactions?.length ? (
            <EmptyState
              icon={Wallet}
              title="Ledger is empty"
              description="Payouts post here the moment a resident settles an invoice."
              compact
            />
          ) : (
            <>
              <div className="border-b border-crete-200 px-5 py-4">
                <p className="text-[12px] text-ink-400">Balance</p>
                <p className="num mt-0.5 text-[26px] font-medium text-pine-600">
                  {money(ledger.balance, { decimals: true })}
                </p>
              </div>
              <ul className="max-h-72 divide-y divide-crete-200 overflow-y-auto">
                {ledger.recent_transactions.map((txn) => (
                  <li
                    key={txn.id}
                    className="flex items-center justify-between gap-3 px-5 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] text-ink-700">
                        {txn.description || "Transaction"}
                      </p>
                      <p className="num text-[11.5px] text-ink-300">
                        {formatDateShort(txn.created_at)} ·{" "}
                        {txn.transaction_type}
                      </p>
                    </div>
                    <span
                      className={`num shrink-0 text-[13.5px] font-medium ${
                        txn.transaction_type === "payout"
                          ? "text-pine-600"
                          : txn.transaction_type === "payment"
                            ? "text-ink-800"
                            : "text-brass-600"
                      }`}
                    >
                      {txn.transaction_type === "payout" ? "+" : ""}
                      {money(txn.amount, { decimals: true })}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Panel>
      </div>

      {/* Reservations */}
      <Panel
        title="Reservations"
        subtitle="Confirm incoming stays to mint their invoices"
        padding="p-0"
        action={
          <span className="num text-[12.5px] text-ink-400">
            {bookings.length} total
          </span>
        }
      >
        {recent.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No reservations yet"
            description="Once a resident books one of your units, it arrives here for confirmation."
            compact
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-left">
              <thead>
                <tr className="border-b border-crete-200 text-[12px] text-ink-400">
                  <th className="px-5 py-2.5 font-medium">Unit</th>
                  <th className="px-5 py-2.5 font-medium">Resident</th>
                  <th className="px-5 py-2.5 font-medium">Stay</th>
                  <th className="px-5 py-2.5 text-right font-medium">Total</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-crete-200">
                {recent.map((booking) => (
                  <tr
                    key={booking.id}
                    className="transition-colors hover:bg-crete-100"
                  >
                    <td className="px-5 py-3">
                      <p className="text-[13.5px] font-medium text-ink-800">
                        {booking.unit_details?.title || "Unit"}
                      </p>
                      <p className="num text-[12px] text-ink-400">
                        {booking.unit_details?.property_title} ·{" "}
                        {booking.unit_details?.unit_number}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-[13.5px] text-ink-600">
                      {booking.tenant_details?.username || "—"}
                    </td>
                    <td className="num px-5 py-3 text-[12.5px] text-ink-500">
                      {formatDateShort(booking.start_date)} →{" "}
                      {formatDateShort(booking.end_date)}
                    </td>
                    <td className="num px-5 py-3 text-right text-[13.5px] font-medium text-ink-800">
                      {money(booking.total_price, { decimals: true })}
                    </td>
                    <td className="px-5 py-3">
                      <StatusTag tone={BOOKING_TONES[booking.status] || "ink"}>
                        {statusLabel(booking.status)}
                      </StatusTag>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {booking.status === "pending" ? (
                        <Button
                          size="sm"
                          loading={confirmingId === booking.id}
                          onClick={() => confirmBooking(booking.id)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Confirm
                        </Button>
                      ) : (
                        <span className="text-[12.5px] text-ink-300">
                          {booking.invoice?.status
                            ? `invoice ${booking.invoice.status}`
                            : "—"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Units + tickets */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Inventory"
          subtitle={`${units.length} unit${units.length === 1 ? "" : "s"} registered`}
          padding="p-0"
          action={
            <Link to="/discover">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          }
        >
          {units.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No units yet"
              description="Register a property, then add its first unit to start taking bookings."
              compact
              action={
                <Link to="/landlord-dashboard/create-property">
                  <Button variant="secondary" size="sm">
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    Register property
                  </Button>
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-crete-200">
              {units.slice(0, 6).map((unit) => (
                <li key={unit.id}>
                  <Link
                    to={`/unit/${unit.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-crete-100"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-medium text-ink-800">
                        {unit.title}
                      </p>
                      <p className="truncate text-[12px] text-ink-400">
                        {unit.property_title} · {unit.unit_number}
                      </p>
                    </div>
                    <span className="num shrink-0 text-[13.5px] text-ink-700">
                      {money(unit.base_price)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Maintenance queue"
          subtitle="Tickets raised against your properties"
          padding="p-0"
          action={
            <Link to="/maintenance">
              <Button variant="ghost" size="sm">
                Open desk
              </Button>
            </Link>
          }
        >
          {tickets.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No tickets"
              description="Resident-raised faults land here and push a websocket notification."
              compact
            />
          ) : (
            <ul className="divide-y divide-crete-200">
              {tickets.slice(0, 6).map((ticket) => (
                <li key={ticket.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-medium text-ink-800">
                        {ticket.title}
                      </p>
                      <p className="num text-[12px] text-ink-300">
                        #{ticket.id} · {ticket.priority} ·{" "}
                        {formatDateShort(ticket.created_at)}
                      </p>
                    </div>
                    <StatusTag
                      tone={
                        ticket.priority === "emergency" || ticket.priority === "high"
                          ? "signal"
                          : ticket.status === "resolved"
                            ? "pine"
                            : "brass"
                      }
                    >
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
