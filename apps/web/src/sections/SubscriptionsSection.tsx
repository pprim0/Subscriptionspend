import { FolderPlus, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { CategoriesTable } from "./subscriptions/CategoriesTable";
import { SubscriptionsTable } from "./subscriptions/SubscriptionsTable";

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

interface ActiveSubscriptionsProps {
  categories: Category[];
  createCategoryAction: (formData: FormData) => Promise<void>;
  createSubscriptionAction: (formData: FormData) => Promise<void>;
  deleteCategoryAction: (formData: FormData) => Promise<void>;
  deleteSubscriptionAction: (formData: FormData) => Promise<void>;
  subscriptions: Subscription[];
  updateSubscriptionAction: (formData: FormData) => Promise<void>;
}

export function ActiveSubscriptions({
  categories,
  createCategoryAction,
  createSubscriptionAction,
  deleteCategoryAction,
  deleteSubscriptionAction,
  subscriptions,
  updateSubscriptionAction,
}: ActiveSubscriptionsProps) {
  const [tab, setTab] = useState("subscriptions");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [categoryEmoji, setCategoryEmoji] = useState("");
  const [subscriptionInterval, setSubscriptionInterval] = useState<
    "monthly" | "weekly" | "yearly"
  >("monthly");
  const categoryEmojiOptions = [
    "🎵",
    "🎬",
    "☁️",
    "💳",
    "🌐",
    "🧠",
    "🛠️",
    "📚",
    "🏋️",
    "📰",
    "🎮",
    "📦",
  ];
  return (
    <section id="workspace" className="w-full min-w-0 scroll-mt-28">
      <Tabs
        defaultValue="subscriptions"
        className="w-full min-w-0"
        value={tab}
        onValueChange={setTab}
      >
        <div className="w-full min-w-0 overflow-hidden rounded-[28px] border border-[var(--border-soft)] bg-[var(--surface-soft)] shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-5 border-b border-[var(--border-soft)] px-6 py-6 sm:flex-row sm:items-center sm:justify-between md:px-8">
            <div className="flex flex-wrap items-center gap-5">
              <TabsList className="rounded-full bg-[var(--surface-muted)] p-1">
                <TabsTrigger
                  value="subscriptions"
                  className="rounded-full px-7"
                >
                  Subscriptions
                </TabsTrigger>
                <TabsTrigger value="categories" className="rounded-full px-7">
                  Categories
                </TabsTrigger>
              </TabsList>
              <span className="text-sm text-[var(--text-soft)]">
                {tab === "subscriptions"
                  ? `${subscriptions.length} total`
                  : `${categories.length} total`}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              {tab === "categories" ? (
                <Button
                  variant="outline"
                  className="h-14 rounded-full border-[var(--border-soft)] bg-white px-7 text-base text-[var(--text-strong)] hover:bg-[var(--surface-tint)]"
                  onClick={() => setIsCategoryOpen(true)}
                >
                  <FolderPlus className="size-5" />
                  Add New Category
                </Button>
              ) : (
                <Button
                  className="h-14 min-w-[27rem] rounded-full bg-[var(--button-dark)] px-10 text-xl font-medium text-[var(--surface-soft)] hover:bg-[var(--button-dark-hover)]"
                  onClick={() => {
                    setSubscriptionInterval("monthly");
                    setIsSubscriptionOpen(true);
                  }}
                >
                  <Plus className="mr-1 size-5" />
                  Add New Subscription
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="subscriptions" className="mt-0 w-full min-w-0">
            <SubscriptionsTable
              categories={categories}
              deleteSubscriptionAction={deleteSubscriptionAction}
              subscriptions={subscriptions}
              updateSubscriptionAction={updateSubscriptionAction}
            />
          </TabsContent>
          <TabsContent value="categories" className="mt-0 w-full min-w-0">
            <CategoriesTable
              categories={categories}
              deleteCategoryAction={deleteCategoryAction}
            />
          </TabsContent>
        </div>
      </Tabs>

      <Dialog open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
        <DialogContent className="rounded-[28px] border-[var(--border-soft)] bg-[var(--surface-soft)]">
          <DialogHeader>
            <DialogTitle>Create a category</DialogTitle>
            <DialogDescription>
              Categories help you group related services and scan spending
              faster.
            </DialogDescription>
          </DialogHeader>
          <form
            action={async (formData) => {
              await createCategoryAction(formData);
              setCategoryEmoji("");
              setIsCategoryOpen(false);
            }}
            className="grid gap-5"
          >
            <div className="grid gap-2">
              <Label htmlFor="category-name">Name</Label>
              <Input
                id="category-name"
                name="name"
                placeholder="Streaming"
                required
                className="h-12 rounded-2xl border-[var(--border-soft)] bg-white px-4 text-base"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category-icon">Emoji</Label>
              <Input
                id="category-icon"
                name="icon"
                placeholder="🎵"
                required
                maxLength={8}
                value={categoryEmoji}
                onChange={(event) => setCategoryEmoji(event.target.value)}
                className="h-12 rounded-2xl border-[var(--border-soft)] bg-white px-4 text-base"
              />
              <p className="text-sm text-[var(--text-soft)]">
                Use one emoji only. We save the first emoji you enter.
              </p>
              <div className="flex flex-wrap gap-2">
                {categoryEmojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setCategoryEmoji(emoji)}
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-xl transition ${
                      categoryEmoji === emoji
                        ? "border-[var(--button-dark)] bg-[var(--surface-tint)]"
                        : "border-[var(--border-soft)] bg-white hover:bg-[var(--surface-tint)]"
                    }`}
                    aria-label={`Use ${emoji} as category emoji`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
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
                className="rounded-2xl bg-[var(--button-dark)] text-white hover:bg-[var(--button-dark-hover)]"
              >
                Create category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isSubscriptionOpen} onOpenChange={setIsSubscriptionOpen}>
        <DialogContent className="rounded-[28px] border-[var(--border-soft)] bg-[var(--surface-soft)]">
          <DialogHeader>
            <DialogTitle>Add a subscription</DialogTitle>
            <DialogDescription>
              Save the price, billing cycle, and the date it starts so the
              calendar and recurring schedule stay accurate.
            </DialogDescription>
          </DialogHeader>
          <form
            action={async (formData) => {
              await createSubscriptionAction(formData);
              setIsSubscriptionOpen(false);
            }}
            className="grid gap-5"
          >
            <div className="grid gap-2">
              <Label htmlFor="subscription-name">Name</Label>
              <Input
                id="subscription-name"
                name="name"
                placeholder="Netflix, Spotify, iCloud+..."
                required
                className="h-12 rounded-2xl border-[var(--border-soft)] bg-white px-4 text-base"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subscription-price">Price</Label>
              <Input
                id="subscription-price"
                name="price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="9.99"
                required
                className="h-12 rounded-2xl border-[var(--border-soft)] bg-white px-4 text-base"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subscription-billing-interval">
                Billing interval
              </Label>
              <select
                id="subscription-billing-interval"
                name="billingInterval"
                value={subscriptionInterval}
                onChange={(event) =>
                  setSubscriptionInterval(
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
              <Label htmlFor="subscription-started-at">Start date</Label>
              <Input
                id="subscription-started-at"
                name="startedAt"
                type="date"
                required
                className="h-12 rounded-2xl border-[var(--border-soft)] bg-white px-4 text-base"
              />
              <p className="text-sm text-[var(--text-soft)]">
                We derive the renewal schedule from this date.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subscription-category">Category</Label>
              <select
                id="subscription-category"
                name="categoryId"
                defaultValue=""
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
                className="rounded-2xl bg-[var(--button-dark)] text-white hover:bg-[var(--button-dark-hover)]"
              >
                Save subscription
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
