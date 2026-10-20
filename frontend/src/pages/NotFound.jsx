import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "../components/ui/Button";
import FloorPlan from "../components/FloorPlan";

const GHOST_UNIT = {
  id: 404,
  unit_number: "404",
  title: "Unallocated space",
  features: { bedrooms: 1 },
};

export default function NotFound() {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div>
        <p className="num text-[13px] font-medium text-brass-500">Error 404</p>
        <h2 className="display mt-3 text-[clamp(2rem,4.5vw,3rem)] font-semibold text-ink-900">
          This route isn&rsquo;t on the plan.
        </h2>
        <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-ink-400">
          The page you asked for doesn&rsquo;t exist &mdash; it may have been
          renamed, or the link is out of date.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/">
            <Button>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to overview
            </Button>
          </Link>
          <Link to="/discover">
            <Button variant="secondary">Browse units</Button>
          </Link>
        </div>
      </div>

      <div className="rounded-card border border-crete-300 bg-crete-50 shadow-hairline">
        <div className="flex items-center justify-between border-b border-crete-200 px-4 py-2.5">
          <span className="num text-[12px] text-ink-500">UNIT 404</span>
          <span className="text-[12px] text-ink-400">no such plan</span>
        </div>
        <FloorPlan unit={GHOST_UNIT} className="block w-full opacity-60" />
      </div>
    </div>
  );
}
