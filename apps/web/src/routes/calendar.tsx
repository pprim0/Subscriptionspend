import { createFileRoute, redirect } from "@tanstack/react-router";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "#/lib/utils";
import { getDashboardDataFn } from "#/server/actions";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const CHART_COLORS = [
  "hsl(14 100% 60%)",
  "hsl(271 62% 63%)",
  "hsl(178 50% 45%)",
  "hsl(42 92% 60%)",
  "hsl(336 82% 72%)",
] as const;

type CalendarSubscription = {
  id: number;
  name: string;
  price: number;
  startedAt: string;
  billingInterval: "monthly" | "weekly" | "yearly";
  billingDay: number;
  billingMonth: number | null;
  billingScheduleConfirmed: boolean;
  category: {
    id: number;
    name: string;
    icon: string;
  } | null;
};

function toMonthly(subscription: CalendarSubscription) {
  if (subscription.billingInterval === "weekly") {
    return (subscription.price * 52) / 12;
  }

  if (subscription.billingInterval === "yearly") {
    return subscription.price / 12;
  }

  return subscription.price;
}

function getChargeColor(id: number) {
  return CHART_COLORS[id % CHART_COLORS.length] ?? CHART_COLORS[0];
}

function chargesForDate(date: Date, subscriptions: CalendarSubscription[]) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const weekday = ((date.getDay() + 6) % 7) + 1;

  return subscriptions.filter((subscription) => {
    const startedAt = new Date(`${subscription.startedAt}T00:00:00`);

    if (date < startedAt) {
      return false;
    }

    if (subscription.billingInterval === "weekly") {
      return subscription.billingDay === weekday;
    }

    if (subscription.billingInterval === "yearly") {
      return (
        subscription.billingDay === day && subscription.billingMonth === month
      );
    }

    return subscription.billingDay === day;
  });
}

export const Route = createFileRoute("/calendar")({
  loader: async () => {
    try {
      return await getDashboardDataFn();
    } catch {
      throw redirect({ to: "/login" });
    }
  },
  component: CalendarPage,
});

function CalendarPage() {
  const { subscriptions } = Route.useLoaderData();
  const typedSubscriptions = subscriptions as CalendarSubscription[];
  const confirmedSubscriptions = typedSubscriptions.filter(
    (subscription) => subscription.billingScheduleConfirmed,
  );
  const subscriptionsNeedingSchedule =
    typedSubscriptions.length - confirmedSubscriptions.length;
  const today = new Date();
  const [cursor, setCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const startOffset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(
      cursor.getFullYear(),
      cursor.getMonth() + 1,
      0,
    ).getDate();
    const result: { date: Date | null; key: string }[] = [];

    for (let i = 0; i < startOffset; i++) {
      result.push({
        date: null,
        key: `empty-start-${cursor.getFullYear()}-${cursor.getMonth()}-${i}`,
      });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      result.push({
        date: new Date(cursor.getFullYear(), cursor.getMonth(), day),
        key: `day-${cursor.getFullYear()}-${cursor.getMonth()}-${day}`,
      });
    }
    let trailingIndex = 0;
    while (result.length % 7 !== 0) {
      result.push({
        date: null,
        key: `empty-end-${cursor.getFullYear()}-${cursor.getMonth()}-${trailingIndex}`,
      });
      trailingIndex += 1;
    }

    return result;
  }, [cursor]);

  const monthCharges = useMemo(() => {
    return cells
      .filter((cell) => cell.date)
      .flatMap((cell) =>
        chargesForDate(cell.date as Date, confirmedSubscriptions).map(
          (subscription) => ({
            date: cell.date as Date,
            subscription,
          }),
        ),
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [cells, confirmedSubscriptions]);

  const monthTotal = monthCharges.reduce(
    (sum, entry) => sum + entry.subscription.price,
    0,
  );
  const upcoming = monthCharges
    .filter(
      (entry) =>
        entry.date >=
        new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    )
    .slice(0, 6);

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-8 sm:py-10">
      <div className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Calendar
            </span>
            <h1 className="mt-2 font-heading text-5xl leading-none md:text-6xl">
              Upcoming charges
            </h1>
            <p className="mt-2 text-muted-foreground">
              See exactly when each subscription is due to hit.
            </p>
          </div>
          <div className="flex items-center gap-6 rounded-[24px] border border-[#eadfd1] bg-white px-6 py-4 shadow-[0_18px_48px_rgba(46,36,29,0.05)]">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                This month
              </p>
              <div className="price-split mt-1">
                <span className="price-split__major numeric-display text-4xl leading-none text-[hsl(220_25%_12%)]">
                  {monthTotal.toFixed(2).split(".")[0]}
                </span>
                <span className="price-split__minor text-lg">
                  .{monthTotal.toFixed(2).split(".")[1]} EUR
                </span>
              </div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Charges
              </p>
              <p className="numeric-display mt-1 text-4xl leading-none">
                {monthCharges.length}
              </p>
            </div>
          </div>
        </div>

        {subscriptionsNeedingSchedule > 0 ? (
          <div className="rounded-[24px] border border-[#ead7c2] bg-[#fff7ec] px-5 py-4 text-sm text-[#6b584b] shadow-[0_10px_28px_rgba(46,36,29,0.04)]">
            {subscriptionsNeedingSchedule} subscription
            {subscriptionsNeedingSchedule === 1 ? "" : "s"} still need a
            confirmed billing date. They stay out of the calendar until you save
            a real schedule from the overview list.
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-[24px] border border-[#eadfd1] bg-white p-6 shadow-[0_18px_48px_rgba(46,36,29,0.05)] lg:col-span-2 md:p-8">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-4xl leading-none">
                {MONTHS[cursor.getMonth()]}{" "}
                <span className="text-muted-foreground">
                  {cursor.getFullYear()}
                </span>
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCursor(
                      new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1),
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-muted transition"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCursor(
                      new Date(today.getFullYear(), today.getMonth(), 1),
                    )
                  }
                  className="h-10 rounded-full border border-border px-4 text-sm transition hover:bg-muted"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCursor(
                      new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1),
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition hover:bg-muted"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-7 gap-px text-xs uppercase tracking-widest text-muted-foreground">
              {WEEKDAYS.map((day) => (
                <div key={day} className="px-2 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-2">
              {cells.map((cell) => {
                if (!cell.date) {
                  return (
                    <div
                      key={cell.key}
                      className="aspect-square rounded-2xl bg-muted/30"
                    />
                  );
                }

                const charges = chargesForDate(cell.date, typedSubscriptions);
                const isToday =
                  cell.date.toDateString() === today.toDateString();

                return (
                  <div
                    key={cell.date.toISOString()}
                    className={cn(
                      "flex aspect-square flex-col rounded-[2rem] border px-4 py-3 transition",
                      isToday
                        ? "border-[hsl(14_100%_60%)] bg-[hsl(14_100%_60%_/_0.05)]"
                        : "border-border/60 bg-card hover:bg-muted/40",
                    )}
                  >
                    <span
                      className={cn(
                        "text-[1.55rem] leading-none font-semibold tracking-[-0.01em]",
                        isToday ? "text-[hsl(14_100%_60%)]" : "text-foreground",
                      )}
                    >
                      {cell.date.getDate()}
                    </span>
                    <div className="mt-auto flex flex-wrap gap-1.5 pb-0.5">
                      {charges.slice(0, 3).map((subscription) => (
                        <span
                          key={subscription.id}
                          title={`${subscription.name} — ${subscription.price.toFixed(2)} EUR`}
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: getChargeColor(subscription.id),
                          }}
                        />
                      ))}
                      {charges.length > 3 ? (
                        <span className="text-[10px] text-muted-foreground">
                          +{charges.length - 3}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-[24px] border border-[hsl(220_25%_12%_/_0.06)] bg-[linear-gradient(180deg,hsl(220_25%_12%)_0%,hsl(220_18%_18%)_100%)] p-7 text-background shadow-[0_18px_48px_rgba(46,36,29,0.12)]">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-background/60" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-background/60">
                Up next
              </span>
            </div>
            <h3 className="numeric-display mt-3 text-4xl leading-none">
              {upcoming.length} charges coming
            </h3>
            <ul className="mt-6 space-y-4">
              {upcoming.length === 0 ? (
                <li className="text-sm text-background/60">
                  Nothing else this month.
                </li>
              ) : null}
              {upcoming.map(({ date, subscription }) => (
                <li
                  key={`${date.toISOString()}-${subscription.id}`}
                  className="flex items-center gap-4"
                >
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl border border-background/10 bg-background/10">
                    <span className="text-[10px] uppercase tracking-widest text-background/60">
                      {MONTHS[date.getMonth()].slice(0, 3)}
                    </span>
                    <span className="numeric-display text-lg leading-none">
                      {date.getDate()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{subscription.name}</p>
                    <p className="text-xs text-background/60">
                      {subscription.category?.name ?? "Uncategorized"}
                    </p>
                  </div>
                  <div className="price-split text-right">
                    <span className="price-split__major numeric-display text-2xl leading-none text-background">
                      {subscription.price.toFixed(2).split(".")[0]}
                    </span>
                    <span className="price-split__minor text-[11px] uppercase tracking-widest text-background/60">
                      .{subscription.price.toFixed(2).split(".")[1]} EUR
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="overflow-hidden rounded-[24px] border border-[#eadfd1] bg-white shadow-[0_18px_48px_rgba(46,36,29,0.05)]">
          <div className="flex items-center justify-between border-b border-border/60 p-6 md:px-8">
            <h2 className="font-heading text-3xl leading-none">
              All charges in {MONTHS[cursor.getMonth()]}
            </h2>
            <span className="text-sm text-muted-foreground">
              {monthCharges.length} total
            </span>
          </div>
          <ul className="divide-y divide-border/60">
            {monthCharges.map(({ date, subscription }) => (
              <li
                key={`${date.toISOString()}-${subscription.id}`}
                className="flex items-center gap-4 px-6 py-4 transition hover:bg-muted/40 md:px-8"
              >
                <div className="flex h-11 w-11 flex-col items-center justify-center rounded-2xl border border-border/60 bg-muted/40">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {MONTHS[date.getMonth()].slice(0, 3)}
                  </span>
                  <span className="numeric-display leading-none">
                    {date.getDate()}
                  </span>
                </div>
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: getChargeColor(subscription.id) }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{subscription.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {subscription.category?.name ?? "Uncategorized"} •{" "}
                    {subscription.billingInterval === "monthly"
                      ? "Monthly"
                      : subscription.billingInterval === "weekly"
                        ? "Weekly"
                        : "Yearly"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="price-split justify-end text-lg">
                    <span className="price-split__major numeric-display text-3xl leading-none text-[hsl(220_25%_12%)]">
                      {subscription.price.toFixed(2).split(".")[0]}
                    </span>
                    <span className="price-split__minor text-[10px] uppercase tracking-widest">
                      .{subscription.price.toFixed(2).split(".")[1]} EUR
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ≈ {toMonthly(subscription).toFixed(2)} / mo
                  </p>
                </div>
              </li>
            ))}
            {monthCharges.length === 0 ? (
              <li className="p-8 text-center text-sm text-muted-foreground">
                No charges this month.
              </li>
            ) : null}
          </ul>
        </section>
      </div>
    </main>
  );
}
