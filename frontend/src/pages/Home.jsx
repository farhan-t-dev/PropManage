import { Link } from "react-router-dom";
import { ArrowRight, Building2, FileText, Receipt, Wrench } from "lucide-react";
import Button from "../components/ui/Button";
import FloorPlan from "../components/FloorPlan";
import { useAuthStore } from "../store/authStore";
import { homeFor } from "../lib/status";

const CAPABILITIES = [
  {
    icon: Receipt,
    title: "Ledgers that reconcile themselves",
    body: "Every payment, payout, fee and refund posts to an append-only ledger the moment an invoice settles. Landlords see a running balance; tenants see exactly what they owe.",
    stat: "4",
    statLabel: "transaction types",
  },
  {
    icon: FileText,
    title: "Documents generated on confirm",
    body: "Confirming a booking queues a Celery task that renders a branded PDF invoice and files it in the document vault — no manual export.",
    stat: "PDF",
    statLabel: "rendered by WeasyPrint",
  },
  {
    icon: Wrench,
    title: "Maintenance with a real state machine",
    body: "Tickets move through pending, in progress and resolved via django-fsm. Resolution demands a cost, so every closure carries a number.",
    stat: "3",
    statLabel: "enforced transitions",
  },
];

const FLOW = [
  { step: "01", title: "Resident books", body: "Dates checked against existing bookings plus a configurable turnover buffer." },
  { step: "02", title: "Landlord confirms", body: "Confirmation triggers the invoice, the PDF and the resident's notification." },
  { step: "03", title: "Resident pays", body: "Paying posts a payment transaction and marks the invoice settled." },
  { step: "04", title: "Payout recorded", body: "The 90% net posts to the landlord ledger, minus the platform fee." },
];

const DEMO_UNIT = {
  id: 1,
  unit_number: "202B",
  title: "Family Penthouse",
  features: { bedrooms: 3, guests: 6 },
};

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-crete-100">
      {/* ── Hero: the console, on the dark side ─────────────────── */}
      <header className="relative overflow-hidden bg-ink-900 text-crete-100">
        <div className="plan-hatch absolute inset-0" aria-hidden="true" />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #7c8996 1px, transparent 1px), linear-gradient(to bottom, #7c8996 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-14 pt-8 sm:px-6 lg:pb-20 lg:pt-10">
          <nav className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/mark.svg" alt="" className="h-8 w-8" />
              <span className="display text-[18px] font-semibold text-crete-50">
                PropManage
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                to="/discover"
                className="hidden rounded-[4px] px-3 py-2 text-[13.5px] text-ink-200 transition-colors hover:text-crete-50 sm:block"
              >
                Discover
              </Link>
              {isAuthenticated ? (
                <Link to={homeFor(user)}>
                  <Button variant="accent" size="sm">
                    Open console
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="console" size="sm">
                      Sign in
                    </Button>
                  </Link>
                  <Link to="/register" className="hidden sm:block">
                    <Button variant="accent" size="sm">
                      Create account
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>

          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="animate-rise">
              <p className="num text-[12.5px] uppercase tracking-[0.18em] text-brass-400">
                Property operations engine
              </p>
              <h1 className="display mt-4 text-[clamp(2.5rem,6vw,4.25rem)] font-semibold text-crete-50">
                Run every unit,
                <br />
                ledger and ticket
                <br />
                from one desk.
              </h1>
              <p className="mt-6 max-w-[46ch] text-[16px] leading-relaxed text-ink-200">
                PropManage gives property portfolios a single system of record:
                nested inventory, atomic financial ledgers, generated legal
                documents and maintenance that follows a real state machine.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/discover">
                  <Button variant="accent" size="lg">
                    Browse available units
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="console" size="lg">
                    Create an account
                  </Button>
                </Link>
              </div>

              <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-5 border-t border-ink-700 pt-6">
                {[
                  ["JWT in HttpOnly cookies", "no token in localStorage"],
                  ["Django Channels", "push events over websockets"],
                  ["Celery + Redis", "async invoice generation"],
                ].map(([term, note]) => (
                  <div key={term}>
                    <dt className="text-[13px] font-medium text-crete-100">
                      {term}
                    </dt>
                    <dd className="text-[12px] text-ink-300">{note}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Plan sheet — the visual signature */}
            <div className="animate-rise" style={{ animationDelay: "120ms" }}>
              <div className="rounded-card border border-ink-600 bg-crete-50 shadow-lift">
                <div className="flex items-center justify-between border-b border-crete-200 px-4 py-2.5">
                  <span className="num text-[12px] text-ink-500">
                    UNIT {DEMO_UNIT.unit_number}
                  </span>
                  <span className="text-[12px] text-ink-400">
                    generated plan
                  </span>
                </div>
                <FloorPlan unit={DEMO_UNIT} className="block w-full" />
                <div className="flex items-center justify-between border-t border-crete-200 px-4 py-3">
                  <div>
                    <p className="text-[14px] font-semibold text-ink-900">
                      {DEMO_UNIT.title}
                    </p>
                    <p className="text-[12px] text-ink-400">
                      {DEMO_UNIT.features.bedrooms} bedrooms · sleeps{" "}
                      {DEMO_UNIT.features.guests}
                    </p>
                  </div>
                  <span className="num text-[18px] font-medium text-pine-600">
                    $450
                  </span>
                </div>
              </div>
              <p className="mt-3 text-center text-[12px] text-ink-400">
                Every unit gets a plan drawn from its own data — no stock photos
                anywhere in this product.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Capabilities ────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="max-w-2xl">
          <h2 className="display text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold text-ink-900">
            An operations desk, not a listing site.
          </h2>
          <p className="mt-3 text-[15.5px] leading-relaxed text-ink-400">
            Three subsystems do the heavy lifting, and each one is built to be
            auditable rather than merely visible.
          </p>
        </div>

        <div className="mt-10 grid gap-px overflow-hidden rounded-card border border-crete-300 bg-crete-300 md:grid-cols-3">
          {CAPABILITIES.map((cap) => (
            <article key={cap.title} className="bg-crete-50 p-6">
              <cap.icon
                className="h-5 w-5 text-brass-500"
                strokeWidth={1.7}
                aria-hidden="true"
              />
              <h3 className="mt-4 text-[17px] font-semibold text-ink-900">
                {cap.title}
              </h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-ink-400">
                {cap.body}
              </p>
              <p className="mt-5 border-t border-crete-200 pt-3">
                <span className="num text-[22px] font-medium text-ink-800">
                  {cap.stat}
                </span>
                <span className="ml-2 text-[12.5px] text-ink-400">
                  {cap.statLabel}
                </span>
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ── The flow — a genuine sequence, so it gets numbers ───── */}
      <section className="border-y border-crete-300 bg-crete-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="display max-w-xl text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold text-ink-900">
              One booking, four guaranteed steps.
            </h2>
            <Link
              to="/register"
              className="flex items-center gap-1.5 text-[14px] font-medium text-pine-600 transition-colors hover:text-pine-700"
            >
              Start a portfolio
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FLOW.map((item, i) => (
              <li key={item.step} className="relative">
                <div className="flex items-center gap-3">
                  <span className="num text-[13px] font-semibold text-brass-500">
                    {item.step}
                  </span>
                  {i < FLOW.length - 1 && (
                    <span
                      className="hidden h-px flex-1 bg-crete-300 lg:block"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <h3 className="mt-3 text-[16px] font-semibold text-ink-900">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-400">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Roles ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-px overflow-hidden rounded-card border border-crete-300 bg-crete-300 lg:grid-cols-2">
          <div className="bg-ink-800 p-8 text-crete-100">
            <Building2 className="h-5 w-5 text-brass-400" strokeWidth={1.7} aria-hidden="true" />
            <h3 className="display mt-4 text-[24px] font-semibold text-crete-50">
              For landlords
            </h3>
            <p className="mt-3 max-w-[44ch] text-[14.5px] leading-relaxed text-ink-200">
              Register properties and units, watch occupancy against a live
              revenue chart, confirm or cancel stays, close tickets with a cost,
              and export the whole book of bookings as CSV.
            </p>
            <ul className="mt-6 space-y-2 text-[13.5px] text-ink-200">
              {["Portfolio dashboard with monthly revenue", "Booking confirmations that mint invoices", "Document vault with PDF download", "Ledger of payouts and platform fees"].map(
                (line) => (
                  <li key={line} className="flex gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brass-400" aria-hidden="true" />
                    {line}
                  </li>
                ),
              )}
            </ul>
          </div>
          <div className="bg-crete-50 p-8">
            <Wrench className="h-5 w-5 text-pine-500" strokeWidth={1.7} aria-hidden="true" />
            <h3 className="display mt-4 text-[24px] font-semibold text-ink-900">
              For residents
            </h3>
            <p className="mt-3 max-w-[44ch] text-[14.5px] leading-relaxed text-ink-400">
              Browse units with real availability, book against a turnover
              buffer, settle invoices in one action and file maintenance
              tickets that report back the moment work starts.
            </p>
            <ul className="mt-6 space-y-2 text-[13.5px] text-ink-500">
              {["Availability checked before you commit", "Invoices generated on confirmation", "Realtime ticket status over websockets", "Every stay itemised with its nights"].map(
                (line) => (
                  <li key={line} className="flex gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-pine-500" aria-hidden="true" />
                    {line}
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-card border border-crete-300 bg-crete-50 px-6 py-5">
          <div>
            <h3 className="text-[16px] font-semibold text-ink-900">
              See it running with seeded demo data.
            </h3>
            <p className="mt-0.5 text-[13.5px] text-ink-400">
              Two properties, three units and four months of settled bookings.
            </p>
          </div>
          <Link to="/login">
            <Button variant="primary" size="lg">
              Open the demo console
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-crete-300 bg-crete-50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6">
          <div className="flex items-center gap-2.5">
            <img src="/mark.svg" alt="" className="h-6 w-6" />
            <span className="text-[13.5px] text-ink-500">
              PropManage — Django, Channels, Celery, React.
            </span>
          </div>
          <nav className="flex gap-6 text-[13.5px]">
            <Link to="/discover" className="text-ink-500 hover:text-ink-800">
              Discover
            </Link>
            <Link to="/login" className="text-ink-500 hover:text-ink-800">
              Sign in
            </Link>
            <Link to="/register" className="text-ink-500 hover:text-ink-800">
              Create account
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
