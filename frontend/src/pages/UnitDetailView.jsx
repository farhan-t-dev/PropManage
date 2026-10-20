import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  BedDouble,
  Calendar,
  CheckCircle2,
  Clock,
  Maximize2,
  Users,
} from "lucide-react";
import api from "../api";
import { money, nightsBetween, todayISO } from "../lib/format";
import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "../store/notificationStore";
import FloorPlan from "../components/FloorPlan";
import Button from "../components/ui/Button";
import Field, { Input } from "../components/ui/Field";
import { Skeleton } from "../components/ui/Skeleton";
import StatusTag from "../components/ui/StatusTag";

export default function UnitDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const showNotification = useNotificationStore((s) => s.showNotification);

  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [startDate, setStartDate] = useState(todayISO(7));
  const [endDate, setEndDate] = useState(todayISO(10));
  const [availability, setAvailability] = useState(null);
  const [checking, setChecking] = useState(false);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    api
      .get(`/units/${id}/`)
      .then((res) => {
        if (!cancelled) setUnit(res.data);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Live availability check — debounced so typing dates doesn't hammer the API.
  const checkAvailability = useCallback(async () => {
    if (!unit || !startDate || !endDate) return;
    if (nightsBetween(startDate, endDate) < 1) {
      setAvailability(false);
      return;
    }
    setChecking(true);
    try {
      const res = await api.get(`/units/${unit.id}/check_availability/`, {
        params: { start_date: startDate, end_date: endDate },
      });
      setAvailability(!!res.data.available);
    } catch {
      setAvailability(null);
    } finally {
      setChecking(false);
    }
  }, [unit, startDate, endDate]);

  useEffect(() => {
    if (!unit) return;
    const t = setTimeout(checkAvailability, 400);
    return () => clearTimeout(t);
  }, [unit, startDate, endDate, checkAvailability]);

  const nights = useMemo(
    () => nightsBetween(startDate, endDate),
    [startDate, endDate],
  );
  const total = useMemo(
    () => (Number(unit?.base_price) || 0) * nights,
    [unit?.base_price, nights],
  );

  async function reserve() {
    if (!isAuthenticated) {
      showNotification("Sign in to reserve this unit.", "warning");
      navigate("/login", { state: { from: { pathname: `/unit/${id}` } } });
      return;
    }
    setBooking(true);
    try {
      const res = await api.post("/bookings/", {
        unit: unit.id,
        start_date: startDate,
        end_date: endDate,
      });
      showNotification(
        res.data?.id
          ? `Reservation requested for ${unit.title}. Awaiting landlord confirmation.`
          : `Reservation requested for ${unit.title}.`,
        "success",
      );
      navigate("/my-bookings");
    } catch (err) {
      const data = err?.response?.data;
      const msg = Array.isArray(data)
        ? data.join(" ")
        : data?.detail ||
          data?.non_field_errors?.[0] ||
          "The unit could not be reserved for these dates.";
      showNotification(msg, "error");
      checkAvailability();
    } finally {
      setBooking(false);
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-[22rem] w-full rounded-card" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-80 w-full rounded-card" />
      </div>
    );
  }

  if (notFound || !unit) {
    return (
      <div className="rounded-card border border-crete-300 bg-crete-50 py-20 text-center">
        <h2 className="display text-[22px] font-semibold text-ink-900">
          That unit is not in the inventory.
        </h2>
        <p className="mt-2 text-[14px] text-ink-400">
          It may have been removed, or the link is out of date.
        </p>
        <Link to="/discover" className="mt-6 inline-block">
          <Button variant="secondary">Back to Discover</Button>
        </Link>
      </div>
    );
  }

  const features = unit.features || {};
  const specs = [
    features.bedrooms != null && {
      icon: BedDouble,
      label: "Bedrooms",
      value: features.bedrooms,
    },
    features.guests != null && {
      icon: Users,
      label: "Capacity",
      value: `sleeps ${features.guests}`,
    },
    features.area != null && {
      icon: Maximize2,
      label: "Floor area",
      value: `${features.area} m²`,
    },
    features.bathrooms != null && {
      icon: Users,
      label: "Bathrooms",
      value: features.bathrooms,
    },
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <Link
        to="/discover"
        className="inline-flex items-center gap-1.5 text-[13.5px] text-ink-400 transition-colors hover:text-ink-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        {unit.property_title}
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        {/* Left — the plan and the description */}
        <div className="space-y-5">
          <div className="overflow-hidden rounded-card border border-crete-300 bg-crete-50 shadow-hairline">
            <div className="flex items-center justify-between border-b border-crete-200 px-4 py-2.5">
              <span className="num text-[12px] text-ink-500">
                UNIT {unit.unit_number || "—"}
              </span>
              <span className="text-[12px] text-ink-400">generated plan</span>
            </div>
            <FloorPlan unit={unit} className="block w-full" />
          </div>

          <div>
            <p className="text-[13px] text-ink-400">{unit.property_title}</p>
            <h2 className="display mt-1 text-[30px] font-semibold text-ink-900">
              {unit.title}
            </h2>
            <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-ink-500">
              {unit.description ||
                "No description has been recorded for this unit yet."}
            </p>
          </div>

          {specs.length > 0 && (
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-crete-300 bg-crete-300 sm:grid-cols-4">
              {specs.map((spec) => (
                <div key={spec.label} className="bg-crete-50 px-4 py-3.5">
                  <dt className="flex items-center gap-1.5 text-[12px] text-ink-400">
                    <spec.icon className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden="true" />
                    {spec.label}
                  </dt>
                  <dd className="num mt-1 text-[16px] font-medium text-ink-800">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {/* Right — the booking rail */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-card border border-crete-300 bg-crete-50 shadow-hairline">
            <div className="flex items-baseline justify-between border-b border-crete-200 px-5 py-4">
              <span className="num text-[26px] font-medium text-ink-900">
                {money(unit.base_price)}
              </span>
              <span className="text-[13px] text-ink-400">per night</span>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Check in" htmlFor="start_date">
                  <Input
                    id="start_date"
                    type="date"
                    min={todayISO(0)}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Field>
                <Field label="Check out" htmlFor="end_date">
                  <Input
                    id="end_date"
                    type="date"
                    min={startDate || todayISO(0)}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Field>
              </div>

              {/* Availability verdict — stated plainly, with the reason */}
              <div
                className={`flex items-start gap-2.5 rounded-[4px] border px-3 py-2.5 text-[13px] leading-snug ${
                  availability === true
                    ? "border-pine-200 bg-pine-50 text-pine-700"
                    : availability === false
                      ? "border-brass-200 bg-brass-50 text-brass-600"
                      : "border-crete-300 bg-crete-100 text-ink-400"
                }`}
              >
                {availability === true ? (
                  <>
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                      Available for these dates.
                      {nights > 0 && ` ${nights} night${nights === 1 ? "" : "s"}.`}
                    </span>
                  </>
                ) : availability === false ? (
                  <>
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                      Not available. An existing booking or the{" "}
                      {unit.turnover_buffer_hours}h turnover buffer covers these
                      dates — try a later check-in.
                    </span>
                  </>
                ) : (
                  <>
                    <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                      {checking
                        ? "Checking availability…"
                        : "Pick both dates to check availability."}
                    </span>
                  </>
                )}
              </div>

              <dl className="space-y-2 border-t border-crete-200 pt-4 text-[13.5px]">
                <div className="flex justify-between">
                  <dt className="text-ink-400">
                    {money(unit.base_price)} × {nights} night
                    {nights === 1 ? "" : "s"}
                  </dt>
                  <dd className="num text-ink-800">{money(total, { decimals: true })}</dd>
                </div>
                <div className="flex justify-between border-t border-crete-200 pt-2">
                  <dt className="font-medium text-ink-700">Estimated total</dt>
                  <dd className="num font-medium text-pine-600">
                    {money(total, { decimals: true })}
                  </dd>
                </div>
              </dl>

              <p className="text-[12px] leading-snug text-ink-400">
                Peak-season stays (Jun–Aug) carry a 20% surge applied when the
                booking is created. The landlord confirms before an invoice is
                issued.
              </p>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled={availability === false || nights < 1}
                loading={booking}
                onClick={reserve}
              >
                {isAuthenticated ? "Reserve this unit" : "Sign in to reserve"}
              </Button>

              <p className="flex items-center justify-center gap-1.5 text-[12px] text-ink-400">
                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                Held against a {unit.turnover_buffer_hours}h turnover buffer
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <StatusTag tone="ink">unit {unit.id}</StatusTag>
            {unit.is_active ? (
              <StatusTag tone="pine">accepting bookings</StatusTag>
            ) : (
              <StatusTag tone="signal">inactive</StatusTag>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
