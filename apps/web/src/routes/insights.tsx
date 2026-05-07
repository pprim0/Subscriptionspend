import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  AlertTriangle,
  Lightbulb,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import { cn } from "#/lib/utils";
import { getDashboardDataFn } from "#/server/actions";

const CHART_COLORS = [
  "hsl(14 100% 60%)",
  "hsl(271 62% 63%)",
  "hsl(178 50% 45%)",
  "hsl(42 92% 60%)",
  "hsl(336 82% 72%)",
] as const;

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

type InsightSubscription = {
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

type ForecastMonth = {
  key: string;
  label: string;
  date: Date;
  total: number;
};

function toMonthlyCost(subscription: InsightSubscription) {
  if (subscription.billingInterval === "weekly") {
    return (subscription.price * 52) / 12;
  }

  if (subscription.billingInterval === "yearly") {
    return subscription.price / 12;
  }

  return subscription.price;
}

function countWeekdayOccurrences(
  year: number,
  monthIndex: number,
  weekday: number,
) {
  const firstDay = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstWeekday = ((firstDay.getDay() + 6) % 7) + 1;
  const offset = (weekday - firstWeekday + 7) % 7;
  const firstOccurrence = 1 + offset;

  if (firstOccurrence > daysInMonth) {
    return 0;
  }

  return 1 + Math.floor((daysInMonth - firstOccurrence) / 7);
}

function buildForecast(subscriptions: InsightSubscription[]) {
  const today = new Date();
  const months: ForecastMonth[] = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() + index, 1);
    const total = subscriptions.reduce((sum, subscription) => {
      const startedAt = new Date(`${subscription.startedAt}T00:00:00`);

      if (
        date.getFullYear() < startedAt.getFullYear() ||
        (date.getFullYear() === startedAt.getFullYear() &&
          date.getMonth() < startedAt.getMonth())
      ) {
        return sum;
      }

      if (subscription.billingInterval === "weekly") {
        return (
          sum +
          countWeekdayOccurrences(
            date.getFullYear(),
            date.getMonth(),
            subscription.billingDay,
          ) *
            subscription.price
        );
      }

      if (subscription.billingInterval === "monthly") {
        return sum + subscription.price;
      }

      if (subscription.billingMonth === date.getMonth() + 1) {
        return sum + subscription.price;
      }

      return sum;
    }, 0);

    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: MONTHS_SHORT[date.getMonth()] ?? "",
      date,
      total,
    };
  });

  return months;
}

function formatDelta(delta: number) {
  if (!Number.isFinite(delta)) {
    return "0.0";
  }

  return delta.toFixed(1);
}

function PriceDisplay({
  amount,
  dark = false,
  size = "xl",
}: {
  amount: number;
  dark?: boolean;
  size?: "lg" | "xl" | "hero";
}) {
  const [major, decimals] = amount.toFixed(2).split(".");
  const majorClassName =
    size === "hero"
      ? "numeric-display text-[4.25rem] sm:text-[5rem]"
      : size === "xl"
        ? "numeric-display text-[3rem]"
        : "numeric-display text-[2.25rem]";

  return (
    <div className="price-split">
      <span
        className={cn(
          "price-split__major leading-none tracking-tight",
          majorClassName,
          dark ? "text-background" : "text-foreground",
        )}
      >
        {major}
      </span>
      <span
        className={cn(
          "price-split__minor",
          size === "hero" ? "text-xl sm:text-2xl" : "text-lg",
          dark ? "text-background/60" : "text-muted-foreground/70",
        )}
      >
        .{decimals} EUR
      </span>
    </div>
  );
}

export const Route = createFileRoute("/insights")({
  loader: async () => {
    try {
      return await getDashboardDataFn();
    } catch {
      throw redirect({ to: "/login" });
    }
  },
  component: InsightsPage,
});

function InsightsPage() {
  const { subscriptions } = Route.useLoaderData();
  const typedSubscriptions = subscriptions as InsightSubscription[];
  const confirmedSubscriptions = typedSubscriptions.filter(
    (subscription) => subscription.billingScheduleConfirmed,
  );
  const unconfirmedCount =
    typedSubscriptions.length - confirmedSubscriptions.length;

  const monthly = useMemo(
    () =>
      typedSubscriptions.reduce(
        (sum, subscription) => sum + toMonthlyCost(subscription),
        0,
      ),
    [typedSubscriptions],
  );

  const byCategory = useMemo(() => {
    const totalMonthly = monthly || 1;
    const map = new Map<string, number>();

    for (const subscription of typedSubscriptions) {
      const categoryName = subscription.category?.name ?? "Uncategorized";
      map.set(
        categoryName,
        (map.get(categoryName) ?? 0) + toMonthlyCost(subscription),
      );
    }

    return [...map.entries()]
      .map(([name, value]) => ({
        name,
        value,
        share: (value / totalMonthly) * 100,
      }))
      .sort((a, b) => b.value - a.value);
  }, [monthly, typedSubscriptions]);

  const forecast = useMemo(
    () => buildForecast(confirmedSubscriptions),
    [confirmedSubscriptions],
  );
  const forecastMax = Math.max(...forecast.map((month) => month.total), 1);
  const averageForecast =
    forecast.reduce((sum, month) => sum + month.total, 0) /
      Math.max(forecast.length, 1) || 0;
  const yearlyForecast = forecast.reduce((sum, month) => sum + month.total, 0);
  const currentMonth = forecast[0]?.total ?? 0;
  const nextMonth = forecast[1]?.total ?? currentMonth;
  const delta =
    currentMonth > 0
      ? ((nextMonth - currentMonth) / currentMonth) * 100
      : nextMonth > 0
        ? 100
        : 0;

  const mostExpensive = useMemo(() => {
    return [...typedSubscriptions].sort(
      (left, right) => toMonthlyCost(right) - toMonthlyCost(left),
    )[0];
  }, [typedSubscriptions]);

  const uncategorizedCount = typedSubscriptions.filter(
    (subscription) => subscription.category == null,
  ).length;

  const smartTip = mostExpensive
    ? `${mostExpensive.name} is your heaviest recurring cost at ${toMonthlyCost(
        mostExpensive,
      ).toFixed(
        2,
      )} EUR per month. Review whether you are using the full plan or could switch to a lighter tier.`
    : "Add a few subscriptions to unlock personalized spending suggestions.";

  const watchOut =
    unconfirmedCount > 0
      ? `${unconfirmedCount} subscription${
          unconfirmedCount === 1 ? "" : "s"
        } still need a confirmed billing schedule. Forecasts stay conservative until those dates are filled in.`
      : uncategorizedCount > 0
        ? `${uncategorizedCount} subscription${
            uncategorizedCount === 1 ? "" : "s"
          } are still uncategorized. Tagging them will sharpen the category insights and make the breakdown easier to trust.`
        : "Everything currently has a confirmed schedule and a category, so the insights view is using the fullest version of your data.";

  const topOneAnnualSavings = mostExpensive
    ? toMonthlyCost(mostExpensive) * 12
    : 0;

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-8 sm:py-10">
      <div className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Insights
            </span>
            <h1 className="mt-2 font-heading text-5xl md:text-6xl">
              Where your money goes
            </h1>
            <p className="mt-2 text-muted-foreground">
              Forecasts, category concentration, and practical ways to reduce
              recurring spend.
            </p>
          </div>
        </div>

        <section className="grid gap-5 md:grid-cols-3">
          <div className="rounded-[24px] border border-[#e5d8ca] bg-white p-7 shadow-[0_18px_48px_rgba(46,36,29,0.06)]">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Avg / month forecast
            </span>
            <div className="mt-3">
              <PriceDisplay amount={averageForecast} size="xl" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Based on confirmed billing schedules over the next 12 months.
            </p>
          </div>

          <div className="rounded-[24px] border border-[#e5d8ca] bg-white p-7 shadow-[0_18px_48px_rgba(46,36,29,0.06)]">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Month over month
            </span>
            <div className="mt-3 flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  delta >= 0
                    ? "bg-[hsl(14_100%_60%_/_0.12)] text-[hsl(14_100%_60%)]"
                    : "bg-[hsl(178_50%_45%_/_0.12)] text-[hsl(178_50%_38%)]",
                )}
              >
                {delta >= 0 ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )}
              </div>
              <span className="numeric-display text-4xl leading-none">
                {delta >= 0 ? "+" : ""}
                {formatDelta(delta)}
                <span className="text-2xl text-muted-foreground/70">%</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Next month compared with the current forecast month.
            </p>
          </div>

          <div className="rounded-[24px] border border-[#322c28] bg-[linear-gradient(180deg,hsl(220_25%_12%)_0%,hsl(220_18%_18%)_100%)] p-7 text-background shadow-[0_18px_48px_rgba(46,36,29,0.06)]">
            <span className="text-xs uppercase tracking-[0.2em] text-background/60">
              12 month forecast
            </span>
            <div className="mt-3">
              <PriceDisplay amount={yearlyForecast} size="xl" dark />
            </div>
            <p className="mt-3 text-sm text-background/60">
              Your projected recurring spend over the next year from confirmed
              schedules.
            </p>
          </div>
        </section>

        {unconfirmedCount > 0 ? (
          <div className="rounded-[24px] border border-[#ead7c2] bg-[#fff7ec] px-5 py-4 text-sm text-[#6b584b] shadow-[0_10px_28px_rgba(46,36,29,0.04)]">
            {unconfirmedCount} subscription{unconfirmedCount === 1 ? "" : "s"}{" "}
            are still missing a confirmed billing schedule, so forecast totals
            only include the subscriptions with real dates.
          </div>
        ) : null}

        <section className="rounded-[24px] border border-[#e5d8ca] bg-white p-7 shadow-[0_18px_48px_rgba(46,36,29,0.06)] md:p-9">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-3xl">Monthly forecast</h2>
            <span className="text-sm text-muted-foreground">
              Next 12 months
            </span>
          </div>
          <div className="mt-8 grid h-56 grid-cols-12 items-end gap-2">
            {forecast.map((month, index) => {
              const height = (month.total / forecastMax) * 100;
              const isCurrent = index === 0;

              return (
                <div
                  key={month.key}
                  className="flex h-full flex-col items-center gap-2"
                >
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className={cn(
                        "w-full rounded-t-xl transition-all",
                        isCurrent
                          ? "bg-[linear-gradient(180deg,hsl(14_100%_60%)_0%,hsl(42_92%_60%)_100%)] shadow-[0_12px_24px_rgba(255,107,71,0.18)]"
                          : "bg-[hsl(220_25%_12%_/_0.82)] hover:bg-[hsl(220_25%_12%)]",
                      )}
                      style={{ height: `${height}%` }}
                      title={`${month.label}: ${month.total.toFixed(2)} EUR`}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-xs",
                      isCurrent
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {month.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-5">
          <div className="rounded-[24px] border border-[#e5d8ca] bg-white p-7 shadow-[0_18px_48px_rgba(46,36,29,0.06)] lg:col-span-3 md:p-9">
            <h2 className="font-heading text-3xl">By category</h2>
            <ul className="mt-6 space-y-5">
              {byCategory.map((category, index) => (
                <li key={category.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{category.name}</span>
                    <span className="numeric-display text-base text-muted-foreground">
                      {category.value.toFixed(2)} EUR{" "}
                      <span className="text-muted-foreground/70">/ mo</span>
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${category.share}%`,
                        backgroundColor:
                          CHART_COLORS[index % CHART_COLORS.length] ??
                          CHART_COLORS[0],
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {category.share.toFixed(1)}% of normalized monthly spend
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-5 lg:col-span-2">
            <div className="rounded-[24px] border border-[#e5d8ca] bg-white p-7 shadow-[0_18px_48px_rgba(46,36,29,0.06)]">
              <div className="flex items-center gap-2 text-[hsl(14_100%_60%)]">
                <Lightbulb className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                  Smart tip
                </span>
              </div>
              <p className="mt-3 text-balance text-[#4b3e34]">{smartTip}</p>
            </div>

            <div className="rounded-[24px] border border-[#e5d8ca] bg-white p-7 shadow-[0_18px_48px_rgba(46,36,29,0.06)]">
              <div className="flex items-center gap-2 text-foreground">
                <AlertTriangle className="h-4 w-4 text-[hsl(42_92%_60%)]" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Watch out
                </span>
              </div>
              <p className="mt-3 text-balance text-muted-foreground">
                {watchOut}
              </p>
            </div>

            <div className="rounded-[24px] border border-[#322c28] bg-[linear-gradient(180deg,hsl(220_25%_12%)_0%,hsl(220_18%_18%)_100%)] p-7 text-background shadow-[0_18px_48px_rgba(46,36,29,0.06)]">
              <span className="text-xs uppercase tracking-[0.2em] text-background/60">
                If you cut the top 1
              </span>
              <div className="mt-3">
                <PriceDisplay amount={topOneAnnualSavings} size="lg" dark />
              </div>
              <p className="mt-3 text-sm text-background/60">
                Annualized impact of removing your single most expensive
                recurring service.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
