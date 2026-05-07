import { CreditCard, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Field, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "#/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";

type Category = {
  id: number;
  name: string;
  icon: string;
};

type Subscription = {
  id: number;
  name: string;
  price: number;
  startedAt: string;
  billingInterval: "monthly" | "weekly" | "yearly";
  billingDay: number;
  billingMonth: number | null;
  billingScheduleConfirmed: boolean;
  category: Category | null;
};

interface SubscriptionsTableProps {
  categories: Category[];
  deleteSubscriptionAction: (formData: FormData) => Promise<void>;
  subscriptions: Subscription[];
  updateSubscriptionAction: (formData: FormData) => Promise<void>;
}

type PageSizes = 5 | 10 | 20;
const PAGE_SIZE_OPTIONS: PageSizes[] = [5, 10, 20];
const TINT_PALETTE = [
  {
    bg: "hsl(14 100% 60% / 0.12)",
    fg: "hsl(14 100% 60%)",
  },
  {
    bg: "hsl(271 62% 63% / 0.13)",
    fg: "hsl(271 62% 63%)",
  },
  {
    bg: "hsl(178 50% 45% / 0.12)",
    fg: "hsl(178 50% 38%)",
  },
  {
    bg: "hsl(42 92% 60% / 0.16)",
    fg: "hsl(38 80% 44%)",
  },
  {
    bg: "hsl(336 82% 72% / 0.14)",
    fg: "hsl(336 58% 58%)",
  },
] as const;

function intervalLabel(billingInterval: Subscription["billingInterval"]) {
  if (billingInterval === "weekly") return "Weekly";
  if (billingInterval === "yearly") return "Yearly";
  return "Monthly";
}

function getTint(index: number) {
  return TINT_PALETTE[index % TINT_PALETTE.length] ?? TINT_PALETTE[0];
}

function getPageItems(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages] as const;
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      "ellipsis",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ] as const;
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ] as const;
}

export function SubscriptionsTable({
  categories,
  deleteSubscriptionAction,
  subscriptions,
  updateSubscriptionAction,
}: SubscriptionsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizes>(5);
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);
  const [editingInterval, setEditingInterval] = useState<
    "monthly" | "weekly" | "yearly"
  >("monthly");
  const totalPages = Math.max(1, Math.ceil(subscriptions.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (subscriptions.length === 0) {
    return (
      <Card className="w-full rounded-[28px] border border-dashed border-[var(--border-soft)] bg-[var(--surface-soft)] py-0 shadow-none">
        <CardContent className="flex flex-col items-center justify-center gap-4 px-8 py-14 text-center">
          <div className="flex size-16 items-center justify-center rounded-[1.5rem] bg-[var(--surface-muted)] text-[var(--text-soft)]">
            <CreditCard className="size-8" />
          </div>
          <h3 className="text-2xl font-semibold text-[var(--text-strong)]">
            No subscriptions yet
          </h3>
          <p className="max-w-xl text-base text-[var(--text-soft)]">
            Add your first recurring service to start tracking the real monthly
            impact on your budget.
          </p>
        </CardContent>
      </Card>
    );
  }

  const startIndex = (currentPage - 1) * pageSize;
  const visibleSubscriptions = subscriptions.slice(
    startIndex,
    startIndex + pageSize,
  );
  const pageItems = getPageItems(currentPage, totalPages);
  let ellipsisCount = 0;

  return (
    <div className="w-full space-y-4">
      <div className="overflow-hidden">
        {visibleSubscriptions.map((subscription, index) => {
          const tint = getTint(startIndex + index);

          return (
            <div
              key={subscription.id}
              className="group grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 border-[var(--border-soft)] px-6 py-7 transition-colors hover:bg-[var(--surface-tint)] not-last:border-b md:px-8"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div
                  className="flex size-16 shrink-0 items-center justify-center rounded-[20px] border border-[var(--border-soft)] text-2xl"
                  style={{ backgroundColor: tint.bg, color: tint.fg }}
                >
                  {subscription.category?.icon ?? "S"}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-2xl font-semibold tracking-tight text-[var(--text-strong)]">
                    {subscription.name}
                  </h3>
                  <p className="truncate text-lg text-[var(--text-soft)]">
                    {subscription.category?.name ?? "Uncategorized"}
                  </p>
                  {!subscription.billingScheduleConfirmed ? (
                    <p className="mt-2 inline-flex rounded-full bg-[var(--warning-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--warning-text)]">
                      Schedule needs confirmation
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="text-right">
                <div className="price-split">
                  <span className="price-split__major numeric-display text-[3.4rem] leading-none text-[var(--text-strong)]">
                    {subscription.price.toFixed(2).split(".")[0]}
                  </span>
                  <span className="price-split__minor text-xl">
                    .{subscription.price.toFixed(2).split(".")[1]} EUR
                  </span>
                </div>
                <p className="mt-1 text-lg text-[var(--text-soft)]">
                  per{" "}
                  {intervalLabel(subscription.billingInterval).toLowerCase()}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start pt-1">
                <Button
                  type="button"
                  variant={
                    subscription.billingScheduleConfirmed ? "ghost" : "outline"
                  }
                  className={
                    subscription.billingScheduleConfirmed
                      ? "h-10 w-10 rounded-full p-0 text-[var(--text-soft)] opacity-0 transition group-hover:opacity-100 hover:bg-[var(--surface-tint)] hover:text-[var(--text-strong)]"
                      : "rounded-full border-[var(--border-soft)] bg-white px-4 text-[var(--text-strong)] hover:bg-[var(--surface-tint)]"
                  }
                  onClick={() => {
                    setEditingSubscription(subscription);
                    setEditingInterval(subscription.billingInterval);
                  }}
                >
                  <Pencil className="size-3.5" />
                  <span className="sr-only">
                    {subscription.billingScheduleConfirmed
                      ? `Edit ${subscription.name}`
                      : `Confirm schedule for ${subscription.name}`}
                  </span>
                  {!subscription.billingScheduleConfirmed ? "Confirm" : null}
                </Button>
                <form action={deleteSubscriptionAction}>
                  <input type="hidden" name="id" value={subscription.id} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon-sm"
                    className="text-[var(--text-soft)] opacity-0 transition group-hover:opacity-100 hover:bg-[var(--surface-tint)] hover:text-[var(--text-strong)]"
                  >
                    <Trash2 className="size-3.5" />
                    <span className="sr-only">Delete {subscription.name}</span>
                  </Button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-col gap-3 px-6 pb-6 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <Field orientation="horizontal" className="w-fit gap-3">
          <FieldLabel htmlFor="select-rows-per-page">Rows per page</FieldLabel>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value) as PageSizes);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-20" id="select-rows-per-page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectGroup>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        {totalPages > 1 ? (
          <Pagination className="mx-0 w-auto sm:ml-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#subscriptions"
                  aria-disabled={currentPage === 1}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                  onClick={(event) => {
                    event.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                />
              </PaginationItem>
              {pageItems.map((item) => {
                const key =
                  item === "ellipsis"
                    ? `ellipsis-${++ellipsisCount}`
                    : `page-${item}`;

                return (
                  <PaginationItem key={key}>
                    {item === "ellipsis" ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href="#subscriptions"
                        isActive={item === currentPage}
                        onClick={(event) => {
                          event.preventDefault();
                          setCurrentPage(item);
                        }}
                      >
                        {item}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  href="#subscriptions"
                  aria-disabled={currentPage === totalPages}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                  onClick={(event) => {
                    event.preventDefault();
                    if (currentPage < totalPages)
                      setCurrentPage(currentPage + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        ) : null}
      </div>
      <Dialog
        open={editingSubscription !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingSubscription(null);
            setEditingInterval("monthly");
          }
        }}
      >
        <DialogContent className="rounded-[28px] border-[var(--border-soft)] bg-[var(--surface-soft)]">
          <DialogHeader>
            <DialogTitle>
              {editingSubscription?.billingScheduleConfirmed
                ? "Edit subscription"
                : "Confirm billing schedule"}
            </DialogTitle>
            <DialogDescription>
              Save the start date and billing interval so the calendar and
              upcoming charges stay reliable.
            </DialogDescription>
          </DialogHeader>
          {editingSubscription ? (
            <form
              action={async (formData) => {
                await updateSubscriptionAction(formData);
                setEditingSubscription(null);
                setEditingInterval("monthly");
              }}
              className="grid gap-5"
            >
              <input type="hidden" name="id" value={editingSubscription.id} />

              <div className="grid gap-2">
                <Label htmlFor="edit-subscription-name">Name</Label>
                <Input
                  id="edit-subscription-name"
                  name="name"
                  defaultValue={editingSubscription.name}
                  required
                  className="h-12 rounded-2xl border-[var(--border-soft)] bg-white px-4 text-base"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-subscription-price">Price</Label>
                <Input
                  id="edit-subscription-price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  defaultValue={editingSubscription.price.toFixed(2)}
                  required
                  className="h-12 rounded-2xl border-[var(--border-soft)] bg-white px-4 text-base"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-subscription-billing-interval">
                  Billing interval
                </Label>
                <select
                  id="edit-subscription-billing-interval"
                  name="billingInterval"
                  value={editingInterval}
                  onChange={(event) =>
                    setEditingInterval(
                      event.target.value as "monthly" | "weekly" | "yearly",
                    )
                  }
                  className="h-12 rounded-2xl border border-[var(--border-soft)] bg-white px-4 text-base text-[var(--text-strong)] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-subscription-started-at">Start date</Label>
                <Input
                  id="edit-subscription-started-at"
                  name="startedAt"
                  type="date"
                  defaultValue={editingSubscription.startedAt}
                  required
                  className="h-12 rounded-2xl border-[var(--border-soft)] bg-white px-4 text-base"
                />
                <p className="text-sm text-[var(--text-soft)]">
                  We derive the renewal schedule from this date.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-subscription-category">Category</Label>
                <select
                  id="edit-subscription-category"
                  name="categoryId"
                  defaultValue={String(editingSubscription.category?.id ?? "")}
                  className="h-12 rounded-2xl border border-[var(--border-soft)] bg-white px-4 text-base text-[var(--text-strong)] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">No category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" size="lg" className="rounded-2xl">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  size="lg"
                  className="rounded-2xl bg-[var(--button-dark)] text-[var(--surface-soft)] hover:bg-[var(--button-dark-hover)]"
                >
                  Save subscription
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
