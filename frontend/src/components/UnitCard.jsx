import { Link } from "react-router-dom";
import { BedDouble, Maximize2, Users } from "lucide-react";
import FloorPlan from "./FloorPlan";
import { money } from "../lib/format";

/**
 * UnitCard — spec-sheet layout. The plan drawing is the image; the numbers
 * carry the rest. No stock photography anywhere in this product.
 */
export default function UnitCard({ unit }) {
  const features = unit.features || {};
  const specs = [
    features.bedrooms != null && {
      icon: BedDouble,
      label: `${features.bedrooms} bed`,
    },
    features.guests != null && {
      icon: Users,
      label: `sleeps ${features.guests}`,
    },
    features.area != null && {
      icon: Maximize2,
      label: `${features.area} m²`,
    },
  ].filter(Boolean);

  return (
    <Link
      to={`/unit/${unit.id}`}
      className="group flex flex-col overflow-hidden rounded-card border border-crete-300 bg-crete-50 shadow-hairline transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-ink-300 hover:shadow-lift"
    >
      <div className="relative border-b border-crete-200 bg-crete-50">
        <FloorPlan unit={unit} className="block w-full transition-transform duration-500 group-hover:scale-[1.015]" />
        <span className="num absolute left-3 top-3 rounded-[3px] border border-crete-300 bg-crete-50/95 px-2 py-1 text-[11.5px] font-medium text-ink-600">
          {unit.unit_number || "—"}
        </span>
        {!unit.is_active && (
          <span className="absolute right-3 top-3 rounded-[3px] border border-signal-100 bg-signal-50 px-2 py-1 text-[11.5px] font-medium text-signal-600">
            Inactive
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="truncate text-[12.5px] text-ink-400">
          {unit.property_title}
        </p>
        <h3 className="mt-0.5 truncate text-[16px] font-semibold text-ink-900">
          {unit.title}
        </h3>

        {specs.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {specs.map((spec) => (
              <li
                key={spec.label}
                className="flex items-center gap-1.5 text-[12.5px] text-ink-400"
              >
                <spec.icon className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden="true" />
                {spec.label}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex items-end justify-between border-t border-crete-200 pt-3">
          <span className="num text-[19px] font-medium text-ink-900">
            {money(unit.base_price)}
            <span className="ml-1 text-[12.5px] font-normal text-ink-400">
              / night
            </span>
          </span>
          <span className="text-[12.5px] font-medium text-pine-600 transition-colors group-hover:text-pine-700">
            View plan
          </span>
        </div>
      </div>
    </Link>
  );
}
