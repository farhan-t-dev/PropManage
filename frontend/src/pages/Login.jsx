import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "../components/ui/Button";
import Field, { Input } from "../components/ui/Field";
import FloorPlan from "../components/FloorPlan";
import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "../store/notificationStore";
import { apiError } from "../lib/format";
import { homeFor } from "../lib/status";

/** Demo credentials, offered as one-click fills. */
const DEMO = [
  { label: "Landlord", username: "landlord_pro", note: "portfolio, ledger, tickets" },
  { label: "Resident", username: "tenant_alice", note: "bookings, invoices, tickets" },
];

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const showNotification = useNotificationStore((s) => s.showNotification);

  const from = location.state?.from?.pathname;

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username.trim(), password);
      showNotification(`Signed in as ${username.trim()}.`, "success");
      // If we arrived from a guarded route, honour it; otherwise go to the
      // workspace matching the freshly loaded role.
      navigate(from || homeFor(useAuthStore.getState().user), { replace: true });
    } catch (err) {
      setError(apiError(err, "Sign in failed. Check your credentials."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      {/* Left — the plan sheet */}
      <div className="relative hidden overflow-hidden bg-ink-900 lg:block">
        <div className="plan-hatch absolute inset-0" aria-hidden="true" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/mark.svg" alt="" className="h-8 w-8" />
            <span className="display text-[18px] font-semibold text-crete-50">
              PropManage
            </span>
          </Link>

          <div>
            <div className="max-w-sm rounded-card border border-ink-600 bg-crete-50">
              <div className="flex items-center justify-between border-b border-crete-200 px-4 py-2.5">
                <span className="num text-[12px] text-ink-500">UNIT 101A</span>
                <span className="text-[12px] text-ink-400">generated plan</span>
              </div>
              <FloorPlan
                unit={{ id: 7, unit_number: "101A", title: "Executive Studio", features: { bedrooms: 1 } }}
                className="block w-full"
              />
            </div>
            <p className="mt-8 max-w-sm text-[15px] leading-relaxed text-ink-200">
              Ledgers, documents and maintenance workflows for people who run
              buildings — not listing sites.
            </p>
          </div>

          <p className="text-[12.5px] text-ink-400">
            Cookie-based JWT · HttpOnly · role-scoped access
          </p>
        </div>
      </div>

      {/* Right — the form */}
      <div className="flex flex-col bg-crete-100">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <img src="/mark.svg" alt="" className="h-7 w-7" />
            <span className="display text-[16px] font-semibold text-ink-900">
              PropManage
            </span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-[13.5px] text-ink-400 transition-colors hover:text-ink-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-16 sm:px-10">
          <div className="w-full max-w-[26rem]">
            <h1 className="display text-[30px] font-semibold text-ink-900">
              Sign in to the operations desk.
            </h1>
            <p className="mt-2 text-[14.5px] text-ink-400">
              Use the seeded demo accounts below, or your own credentials.
            </p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              <Field label="Username" htmlFor="username">
                <Input
                  id="username"
                  name="username"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="landlord_pro"
                />
              </Field>

              <Field label="Password" htmlFor="password">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </Field>

              {error && (
                <p
                  role="alert"
                  className="rounded-[4px] border border-signal-100 bg-signal-50 px-3 py-2.5 text-[13px] leading-snug text-signal-600"
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                loading={loading}
                disabled={!username || !password}
                className="w-full"
                size="lg"
              >
                Sign in
              </Button>
            </form>

            <div className="mt-8 rounded-card border border-crete-300 bg-crete-50 p-4">
              <p className="text-[12.5px] font-medium text-ink-500">
                Demo accounts
              </p>
              <div className="mt-3 space-y-2">
                {DEMO.map((account) => (
                  <button
                    key={account.username}
                    type="button"
                    onClick={() => {
                      setUsername(account.username);
                      setPassword("pass123");
                      setError(null);
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-[4px] border border-crete-300 bg-crete-100 px-3 py-2.5 text-left transition-colors hover:border-brass-500 hover:bg-brass-50"
                  >
                    <span>
                      <span className="block text-[13.5px] font-medium text-ink-800">
                        {account.label}
                      </span>
                      <span className="num block text-[12px] text-ink-400">
                        {account.username} · pass123
                      </span>
                    </span>
                    <span className="text-[12px] text-ink-400">
                      {account.note}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-6 text-center text-[13.5px] text-ink-400">
              No account yet?{" "}
              <Link
                to="/register"
                className="font-medium text-pine-600 hover:text-pine-700"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
