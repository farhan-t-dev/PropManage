import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Check, Plus } from "lucide-react";
import api from "../api";
import { apiError, fieldError } from "../lib/format";
import { useNotificationStore } from "../store/notificationStore";
import Button from "../components/ui/Button";
import Field, { Input, Select, Textarea } from "../components/ui/Field";
import Panel from "../components/ui/Panel";

/**
 * Two-stage form: register the property, then attach its first unit.
 * The API creates them separately, so the flow follows the same order —
 * but the resident never sees two disconnected screens.
 */
export default function CreatePropertyView() {
  const navigate = useNavigate();
  const showNotification = useNotificationStore((s) => s.showNotification);

  const [stage, setStage] = useState("property"); // property | unit | done
  const [property, setProperty] = useState(null);

  const [propForm, setPropForm] = useState({
    title: "",
    address: "",
    description: "",
  });
  const [propError, setPropError] = useState(null);
  const [savingProp, setSavingProp] = useState(false);

  const [unitForm, setUnitForm] = useState({
    unit_number: "",
    title: "",
    description: "",
    base_price: "",
    bedrooms: "1",
    guests: "2",
  });
  const [unitError, setUnitError] = useState(null);
  const [savingUnit, setSavingUnit] = useState(false);
  const [skipping, setSkipping] = useState(false);

  const setProp = (key) => (e) =>
    setPropForm((f) => ({ ...f, [key]: e.target.value }));
  const setUnit = (key) => (e) =>
    setUnitForm((f) => ({ ...f, [key]: e.target.value }));

  async function createProperty(e) {
    e.preventDefault();
    setSavingProp(true);
    setPropError(null);
    try {
      const res = await api.post("/properties/", {
        title: propForm.title.trim(),
        address: propForm.address.trim(),
        description: propForm.description.trim(),
      });
      setProperty(res.data);
      setStage("unit");
      showNotification("Property registered. Now add its first unit.", "success");
    } catch (err) {
      setPropError(apiError(err, "The property could not be registered."));
    } finally {
      setSavingProp(false);
    }
  }

  async function createUnit(e) {
    e.preventDefault();
    setSavingUnit(true);
    setUnitError(null);
    try {
      await api.post("/units/", {
        property: property.id,
        unit_number: unitForm.unit_number.trim(),
        title: unitForm.title.trim(),
        description: unitForm.description.trim(),
        base_price: unitForm.base_price,
        is_active: true,
        features: {
          bedrooms: Number(unitForm.bedrooms) || 1,
          guests: Number(unitForm.guests) || 2,
        },
      });
      setStage("done");
      showNotification(
        `${unitForm.title.trim()} is live and taking bookings.`,
        "success",
      );
      navigate("/landlord-dashboard");
    } catch (err) {
      setUnitError(apiError(err, "The unit could not be added."));
    } finally {
      setSavingUnit(false);
    }
  }

  async function skipUnit() {
    setSkipping(true);
    try {
      showNotification(
        "Property saved. Add units whenever you're ready.",
        "success",
      );
      navigate("/landlord-dashboard");
    } finally {
      setSkipping(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="display text-[28px] font-semibold text-ink-900">
          Register a property
        </h2>
        <p className="mt-1 max-w-[58ch] text-[14px] leading-relaxed text-ink-400">
          A property is the shell — address and description. Units live inside
          it and carry their own price, capacity and turnover buffer.
        </p>
      </div>

      {/* Progress — two real steps, so the markers mean something */}
      <ol className="flex items-center gap-3">
        {[
          { key: "property", label: "Property" },
          { key: "unit", label: "First unit" },
        ].map((step, i) => {
          const active = stage === step.key;
          const done =
            (step.key === "property" && stage !== "property") ||
            (step.key === "unit" && stage === "done");
          return (
            <li key={step.key} className="flex items-center gap-3">
              <span
                className={`num flex h-6 w-6 items-center justify-center rounded-full border text-[12px] font-medium ${
                  done
                    ? "border-pine-500 bg-pine-500 text-white"
                    : active
                      ? "border-brass-500 bg-brass-50 text-brass-600"
                      : "border-crete-300 bg-crete-50 text-ink-300"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
              </span>
              <span
                className={`text-[13.5px] ${
                  active ? "font-medium text-ink-800" : "text-ink-400"
                }`}
              >
                {step.label}
              </span>
              {i === 0 && (
                <span className="mx-1 h-px w-8 bg-crete-300" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>

      {stage === "property" && (
        <Panel title="Property details" subtitle="What and where.">
          <form onSubmit={createProperty} className="space-y-4">
            <Field
              label="Title"
              htmlFor="title"
              error={fieldError(propError, "title")}
            >
              <Input
                id="title"
                value={propForm.title}
                onChange={setProp("title")}
                placeholder="Metropolis Heights"
                invalid={!!fieldError(propError, "title")}
                required
              />
            </Field>
            <Field
              label="Address"
              htmlFor="address"
              error={fieldError(propError, "address")}
            >
              <Input
                id="address"
                value={propForm.address}
                onChange={setProp("address")}
                placeholder="100 Skyline Blvd"
                invalid={!!fieldError(propError, "address")}
                required
              />
            </Field>
            <Field label="Description" htmlFor="description">
              <Textarea
                id="description"
                rows={3}
                value={propForm.description}
                onChange={setProp("description")}
                placeholder="A short line residents will read when they browse."
              />
            </Field>

            {propError && !fieldError(propError, "title") && !fieldError(propError, "address") && (
              <p
                role="alert"
                className="rounded-[4px] border border-signal-100 bg-signal-50 px-3 py-2.5 text-[13px] text-signal-600"
              >
                {propError}
              </p>
            )}

            <div className="flex gap-2 border-t border-crete-200 pt-4">
              <Button type="submit" loading={savingProp}>
                <Building2 className="h-4 w-4" aria-hidden="true" />
                Register property
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/landlord-dashboard")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Panel>
      )}

      {stage === "unit" && property && (
        <Panel
          title={`Add the first unit to ${property.title}`}
          subtitle={`${property.address || "No address recorded"} · a unit can be added later from the dashboard`}
        >
          <form onSubmit={createUnit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Unit number"
                htmlFor="unit_number"
                error={fieldError(unitError, "unit_number")}
              >
                <Input
                  id="unit_number"
                  value={unitForm.unit_number}
                  onChange={setUnit("unit_number")}
                  placeholder="101A"
                  invalid={!!fieldError(unitError, "unit_number")}
                  required
                />
              </Field>
              <Field
                label="Unit title"
                htmlFor="unit_title"
                error={fieldError(unitError, "title")}
              >
                <Input
                  id="unit_title"
                  value={unitForm.title}
                  onChange={setUnit("title")}
                  placeholder="Executive Studio"
                  invalid={!!fieldError(unitError, "title")}
                  required
                />
              </Field>
              <Field
                label="Price per night"
                htmlFor="base_price"
                error={fieldError(unitError, "base_price")}
                hint="Peak-season surge is applied on top at booking."
              >
                <div className="relative">
                  <span className="num pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
                    $
                  </span>
                  <Input
                    id="base_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={unitForm.base_price}
                    onChange={setUnit("base_price")}
                    placeholder="150.00"
                    className="pl-7"
                    invalid={!!fieldError(unitError, "base_price")}
                    required
                  />
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Bedrooms" htmlFor="bedrooms">
                  <Select
                    id="bedrooms"
                    value={unitForm.bedrooms}
                    onChange={setUnit("bedrooms")}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Sleeps" htmlFor="guests">
                  <Select
                    id="guests"
                    value={unitForm.guests}
                    onChange={setUnit("guests")}
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            </div>

            <Field label="Description" htmlFor="unit_description">
              <Textarea
                id="unit_description"
                rows={2}
                value={unitForm.description}
                onChange={setUnit("description")}
                placeholder="High floor, city view."
              />
            </Field>

            {unitError && !fieldError(unitError, "unit_number") && !fieldError(unitError, "title") && !fieldError(unitError, "base_price") && (
              <p
                role="alert"
                className="rounded-[4px] border border-signal-100 bg-signal-50 px-3 py-2.5 text-[13px] text-signal-600"
              >
                {unitError}
              </p>
            )}

            <div className="flex flex-wrap gap-2 border-t border-crete-200 pt-4">
              <Button type="submit" loading={savingUnit}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add unit
              </Button>
              <Button
                type="button"
                variant="secondary"
                loading={skipping}
                onClick={skipUnit}
              >
                Skip for now
              </Button>
            </div>
          </form>
        </Panel>
      )}
    </div>
  );
}
