import { Breakdown, type BreakdownItem } from "#/components/Breakdown";

interface StatSectionProps {
  monthlyCost: number;
  yearlyCost: number;
  dailyCost: number;
  breakdownStats: BreakdownItem[];
  activeSubscriptions: number;
}

interface PriceDisplayProps {
  amount: number;
  majorClassName?: string;
  minorClassName?: string;
}

function PriceDisplay({
  amount,
  majorClassName = "numeric-display text-6xl leading-none tracking-tight",
  minorClassName = "text-lg",
}: PriceDisplayProps) {
  const [major, decimals] = amount.toFixed(2).split(".");

  return (
    <div className="price-split">
      <span className={`price-split__major ${majorClassName}`}>{major}</span>
      <span className={`price-split__minor ${minorClassName}`}>
        .{decimals} EUR
      </span>
    </div>
  );
}

interface SmallStatProps {
  label: string;
  value: React.ReactNode;
  dark?: boolean;
}

function SmallStat({ label, value, dark = false }: SmallStatProps) {
  return (
    <div
      className={`rounded-[24px] border p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)] ${
        dark
          ? "border-[var(--button-dark)] bg-[linear-gradient(180deg,#182033_0%,#22304a_100%)] text-[var(--surface-soft)] shadow-[0_20px_48px_rgba(24,32,51,0.18)]"
          : "border-[var(--border-soft)] bg-white text-[var(--text-strong)]"
      }`}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-[0.16em] ${
          dark ? "text-[rgba(255,255,255,0.62)]" : "text-[var(--text-soft)]"
        }`}
      >
        {label}
      </p>
      <div className="mt-3">{value}</div>
    </div>
  );
}

function formatSupportingCost(amount: number, unit: "year" | "day") {
  if (amount <= 0) {
    return `0.0 per ${unit}`;
  }

  return `${amount.toFixed(amount < 10 ? 1 : 0)} per ${unit}`;
}

export function StatsSection({
  monthlyCost,
  yearlyCost,
  dailyCost,
  breakdownStats,
  activeSubscriptions,
}: StatSectionProps) {
  const yearlyEquivalent = yearlyCost / 8;
  const dailyEquivalent = dailyCost / 4;

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1.7fr_0.85fr_0.85fr]">
        <div className="overflow-hidden rounded-[24px] border border-[var(--border-soft)] bg-white p-7 shadow-[0_18px_48px_rgba(15,23,42,0.05)] sm:p-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">
                Monthly spending
              </p>
              <div className="mt-5">
                <PriceDisplay
                  amount={monthlyCost}
                  majorClassName="numeric-display text-[5.25rem] leading-[0.88] tracking-tight text-[var(--text-strong)] sm:text-[6.5rem]"
                  minorClassName="text-2xl sm:text-3xl"
                />
              </div>
              <p className="mt-5 text-base text-[var(--text-soft)]">
                {activeSubscriptions} active subscriptions across all recurring
                charges.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-[var(--surface-tint)] px-4 py-2 text-sm font-medium text-[var(--text-soft)]">
              on track
            </span>
          </div>
        </div>

        <SmallStat
          label="Yearly"
          value={
            <div>
              <PriceDisplay
                amount={yearlyCost}
                majorClassName="numeric-display text-[3rem] leading-none tracking-tight text-[var(--text-strong)]"
                minorClassName="text-lg"
              />
              <p className="mt-4 text-sm text-[var(--text-soft)]">
                {formatSupportingCost(yearlyEquivalent, "year")}
              </p>
            </div>
          }
        />

        <SmallStat
          label="Daily"
          value={
            <div>
              <PriceDisplay
                amount={dailyCost}
                majorClassName="numeric-display text-[3rem] leading-none tracking-tight text-[var(--surface-soft)]"
                minorClassName="text-lg"
              />
              <p className="mt-4 text-sm text-[rgba(255,253,252,0.65)]">
                {formatSupportingCost(dailyEquivalent, "day")}
              </p>
            </div>
          }
          dark
        />
      </section>

      <Breakdown items={breakdownStats} />
    </div>
  );
}
