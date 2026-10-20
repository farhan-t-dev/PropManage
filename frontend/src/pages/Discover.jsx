import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LayoutGrid, RotateCcw, Search } from "lucide-react";
import api from "../api";
import { listOf, money } from "../lib/format";
import { SkeletonCards } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import Field, { Input } from "../components/ui/Field";
import UnitCard from "../components/UnitCard";

const PAGE_SIZE = 12;

export default function Discover() {
  // Filters live in the URL so a search can be shared or bookmarked.
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const minPrice = params.get("min_price") || "";
  const maxPrice = params.get("max_price") || "";
  const ordering = params.get("ordering") || "";

  const [draft, setDraft] = useState({
    search,
    min_price: minPrice,
    max_price: maxPrice,
  });
  const [units, setUnits] = useState([]);
  const [count, setCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setDraft({ search, min_price: minPrice, max_price: maxPrice });
  }, [search, minPrice, maxPrice]);

  const fetchUnits = useCallback(
    async (append = false) => {
      setLoading(true);
      setError(null);
      try {
        const query = { page_size: PAGE_SIZE };
        if (search) query.search = search;
        if (minPrice) query.min_price = minPrice;
        if (maxPrice) query.max_price = maxPrice;
        if (ordering) query.ordering = ordering;

        const res = await api.get("/units/", { params: query });
        const data = res.data;
        const rows = listOf(data);
        setUnits((prev) => (append ? [...prev, ...rows] : rows));
        setCount(data.count ?? rows.length);
        setNextPage(data.next || null);
      } catch (err) {
        if (!append) setUnits([]);
        setError(
          err?.response?.status === 401
            ? "Sign in to browse the full inventory."
            : "Could not load units. The API may be restarting — try again.",
        );
      } finally {
        setLoading(false);
      }
    },
    [search, minPrice, maxPrice, ordering],
  );

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  function applyFilters(e) {
    e?.preventDefault();
    const next = new URLSearchParams();
    if (draft.search.trim()) next.set("search", draft.search.trim());
    if (draft.min_price) next.set("min_price", draft.min_price);
    if (draft.max_price) next.set("max_price", draft.max_price);
    if (ordering) next.set("ordering", ordering);
    setParams(next);
  }

  function clearFilters() {
    setDraft({ search: "", min_price: "", max_price: "" });
    setParams(new URLSearchParams());
  }

  const hasFilters = !!(search || minPrice || maxPrice || ordering);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="display text-[28px] font-semibold text-ink-900">
            Available units
          </h2>
          <p className="mt-1 text-[14px] text-ink-400">
            {loading
              ? "Loading inventory…"
              : `${count} unit${count === 1 ? "" : "s"} across the portfolio`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-[13px] text-ink-500">
            Sort
            <select
              value={ordering}
              onChange={(e) => {
                const next = new URLSearchParams(params);
                if (e.target.value) next.set("ordering", e.target.value);
                else next.delete("ordering");
                setParams(next);
              }}
              className="field w-auto py-1.5 text-[13px]"
            >
              <option value="">Default</option>
              <option value="base_price">Price, low to high</option>
              <option value="-base_price">Price, high to low</option>
            </select>
          </label>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <form
        onSubmit={applyFilters}
        className="flex flex-wrap items-end gap-3 rounded-card border border-crete-300 bg-crete-50 p-4 shadow-hairline"
      >
        <Field label="Search" htmlFor="q" className="min-w-[12rem] flex-1">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-300"
              aria-hidden="true"
            />
            <Input
              id="q"
              value={draft.search}
              onChange={(e) =>
                setDraft((d) => ({ ...d, search: e.target.value }))
              }
              placeholder="Unit, number or property"
              className="pl-9"
            />
          </div>
        </Field>
        <Field label="Min $ / night" htmlFor="min_price" className="w-32">
          <Input
            id="min_price"
            type="number"
            min="0"
            value={draft.min_price}
            onChange={(e) =>
              setDraft((d) => ({ ...d, min_price: e.target.value }))
            }
            placeholder="0"
          />
        </Field>
        <Field label="Max $ / night" htmlFor="max_price" className="w-32">
          <Input
            id="max_price"
            type="number"
            min="0"
            value={draft.max_price}
            onChange={(e) =>
              setDraft((d) => ({ ...d, max_price: e.target.value }))
            }
            placeholder="1000"
          />
        </Field>
        <Button type="submit" variant="secondary">
          Apply filters
        </Button>
      </form>

      {loading ? (
        <SkeletonCards count={6} />
      ) : error ? (
        <div className="rounded-card border border-crete-300 bg-crete-50">
          <EmptyState
            icon={LayoutGrid}
            title="Inventory unavailable"
            description={error}
            action={
              <Button variant="secondary" size="sm" onClick={() => fetchUnits()}>
                Try again
              </Button>
            }
          />
        </div>
      ) : units.length === 0 ? (
        <div className="rounded-card border border-crete-300 bg-crete-50">
          <EmptyState
            icon={LayoutGrid}
            title={hasFilters ? "No units match those filters" : "No units listed yet"}
            description={
              hasFilters
                ? "Widen the price range or clear the filters to see the whole portfolio."
                : "Once a landlord registers a property and its units, they appear here."
            }
            action={
              hasFilters ? (
                <Button variant="secondary" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : null
            }
          />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {units.map((unit) => (
              <UnitCard key={unit.id} unit={unit} />
            ))}
          </div>
          {nextPage && (
            <div className="flex justify-center pt-2">
              <Button
                variant="secondary"
                onClick={() => fetchUnits(true)}
                loading={loading}
              >
                Load more units
              </Button>
            </div>
          )}
        </>
      )}

      {!loading && units.length > 0 && (
        <p className="num text-center text-[12.5px] text-ink-400">
          showing {units.length} of {count} · from {money(Math.min(...units.map((u) => Number(u.base_price) || 0)))} per night
        </p>
      )}
    </div>
  );
}
