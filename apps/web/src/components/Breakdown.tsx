import { useMemo, useState } from "react";

export interface BreakdownItem {
  name: string;
  value: number;
  color: string;
  category: string;
  categoryColor: string;
}

interface BreakdownProps {
  items: BreakdownItem[];
}

export function Breakdown({ items }: BreakdownProps) {
  const [breakdownType, setBreakdownType] = useState<
    "category" | "subscription"
  >("subscription");

  const visibleItems = useMemo(() => {
    if (breakdownType === "subscription") {
      return items;
    }

    return Object.values(
      items.reduce<Record<string, BreakdownItem>>((acc, item) => {
        const existing = acc[item.category];

        if (existing) {
          existing.value += item.value;
          return acc;
        }

        acc[item.category] = {
          name: item.category,
          category: item.category,
          color: item.categoryColor,
          categoryColor: item.categoryColor,
          value: item.value,
        };

        return acc;
      }, {}),
    ).sort((a, b) => b.value - a.value);
  }, [breakdownType, items]);

  const total = visibleItems.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="rounded-[24px] border border-[var(--border-soft)] bg-white p-7 shadow-[0_18px_48px_rgba(15,23,42,0.05)] md:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">
            Breakdown
          </h2>
          <div className="inline-flex items-center gap-1 text-sm">
            <button
              type="button"
              className={
                breakdownType === "subscription"
                  ? "rounded-full bg-[var(--button-dark)] px-4 py-2 font-medium text-[var(--surface-soft)]"
                  : "rounded-full px-3 py-2 text-[var(--text-soft)] hover:text-[var(--text-strong)]"
              }
              onClick={() => setBreakdownType("subscription")}
            >
              By Subscription
            </button>
            <button
              type="button"
              className={
                breakdownType === "category"
                  ? "rounded-full bg-[var(--button-dark)] px-4 py-2 font-medium text-[var(--surface-soft)]"
                  : "rounded-full px-3 py-2 text-[var(--text-soft)] hover:text-[var(--text-strong)]"
              }
              onClick={() => setBreakdownType("category")}
            >
              By Category
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-[var(--text-soft)]">
            {visibleItems.length} subscriptions
          </p>
        </div>
      </div>

      <div className="mt-7 flex h-4 overflow-hidden rounded-full bg-[var(--surface-muted)]">
        {visibleItems.map((item) => (
          <div
            key={item.name}
            className="h-full"
            style={{
              width: `${(item.value / total) * 100}%`,
              backgroundColor: item.color,
            }}
          />
        ))}
      </div>

      <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3">
        {visibleItems.map((item) => (
          <div key={item.name} className="flex items-center gap-2.5">
            <span
              className="size-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm font-medium" style={{ color: item.color }}>
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
