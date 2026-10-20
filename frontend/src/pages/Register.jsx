import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, User as UserIcon } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Button from "../components/ui/Button";
import Field, { Input } from "../components/ui/Field";
import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "../store/notificationStore";
import { apiError, fieldError } from "../lib/format";
import { homeFor } from "../lib/status";

const ROLES = [
  {
    value: "tenant",
    icon: UserIcon,
    title: "Resident",
    body: "Book units, settle invoices and file maintenance tickets.",
  },
  {
    value: "landlord",
    icon: Building2,
    title: "Landlord",
    body: "Register properties, confirm stays, track revenue and payouts.",
  },
];

export default function Register() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    role: "tenant",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuthStore();
  const showNotification = useNotificationStore((s) => s.showNotification);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({
        ...form,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
      });
      showNotification("Account created. Welcome aboard.", "success");
      navigate(homeFor(useAuthStore.getState().user), { replace: true });
    } catch (err) {
      setError(apiError(err, "Could not create the account."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-crete-100">
      <div className="mx-auto max-w-2xl px-6 py-10 sm:px-10 lg:py-16">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/mark.svg" alt="" className="h-8 w-8" />
            <span className="display text-[18px] font-semibold text-ink-900">
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

        <h1 className="display mt-12 text-[clamp(2rem,4.5vw,2.75rem)] font-semibold text-ink-900">
          Create your account.
        </h1>
        <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-ink-400">
          Pick the side of the platform you need. Both share the same ledger,
          the same documents and the same maintenance desk.
        </p>

        <form onSubmit={submit} className="mt-10 space-y-8">
          {/* Role — the one decision that shapes everything downstream */}
          <fieldset>
            <legend className="mb-3 text-[13px] font-medium text-ink-700">
              I am registering as
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {ROLES.map((role) => {
                const selected = form.role === role.value;
                return (
                  <label
                    key={role.value}
                    className={twMerge(
                      clsx(
                        "cursor-pointer rounded-card border p-4 transition-colors",
                        selected
                          ? "border-brass-500 bg-brass-50"
                          : "border-crete-300 bg-crete-50 hover:border-ink-300",
                      ),
                    )}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={selected}
                      onChange={set("role")}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2.5">
                      <role.icon
                        className={clsx(
                          "h-4.5 w-4.5",
                          selected ? "text-brass-600" : "text-ink-400",
                        )}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                      <span
                        className={clsx(
                          "text-[15px] font-semibold",
                          selected ? "text-ink-900" : "text-ink-700",
                        )}
                      >
                        {role.title}
                      </span>
                      <span
                        className={clsx(
                          "ml-auto h-3.5 w-3.5 rounded-full border-2",
                          selected
                            ? "border-brass-500 bg-brass-500"
                            : "border-crete-400",
                        )}
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-2 text-[13px] leading-snug text-ink-400">
                      {role.body}
                    </p>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name" htmlFor="first_name">
              <Input
                id="first_name"
                autoComplete="given-name"
                value={form.first_name}
                onChange={set("first_name")}
                required
              />
            </Field>
            <Field label="Last name" htmlFor="last_name">
              <Input
                id="last_name"
                autoComplete="family-name"
                value={form.last_name}
                onChange={set("last_name")}
                required
              />
            </Field>
            <Field
              label="Username"
              htmlFor="username"
              error={fieldError(error, "username")}
            >
              <Input
                id="username"
                autoComplete="username"
                value={form.username}
                onChange={set("username")}
                invalid={!!fieldError(error, "username")}
                required
              />
            </Field>
            <Field
              label="Email"
              htmlFor="email"
              error={fieldError(error, "email")}
            >
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={set("email")}
                invalid={!!fieldError(error, "email")}
                required
              />
            </Field>
            <Field
              label="Password"
              htmlFor="password"
              hint="Any string is accepted in this demo."
              error={fieldError(error, "password")}
              className="sm:col-span-2"
            >
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={set("password")}
                invalid={!!fieldError(error, "password")}
                required
              />
            </Field>
          </div>

          {error && !fieldError(error, "username") && !fieldError(error, "email") && !fieldError(error, "password") && (
            <p
              role="alert"
              className="rounded-[4px] border border-signal-100 bg-signal-50 px-3 py-2.5 text-[13px] text-signal-600"
            >
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 border-t border-crete-300 pt-6">
            <Button type="submit" loading={loading} size="lg">
              Create account
            </Button>
            <p className="text-[13.5px] text-ink-400">
              Already registered?{" "}
              <Link
                to="/login"
                className="font-medium text-pine-600 hover:text-pine-700"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
