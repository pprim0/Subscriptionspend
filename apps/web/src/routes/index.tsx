import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { StatsSection } from "#/sections/StatsSection";
import { ActiveSubscriptions } from "#/sections/SubscriptionsSection";
import {
  createCategoryFn,
  createSubscriptionFn,
  deleteCategoryFn,
  deleteSubscriptionFn,
  getDashboardDataFn,
  updateSubscriptionFn,
} from "#/server/actions";

function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

function mulberry32(a: number): () => number {
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededHexColor(seedStr: string): string {
  const palette = [
    "hsl(14 100% 60%)",
    "hsl(271 62% 63%)",
    "hsl(178 50% 45%)",
    "hsl(42 92% 60%)",
    "hsl(336 82% 72%)",
  ];
  const seed = xmur3(seedStr)();
  const rand = mulberry32(seed);
  return palette[Math.floor(rand() * palette.length)] ?? palette[0];
}

function toMonthlyPrice(
  price: number,
  billingInterval: "monthly" | "weekly" | "yearly",
): number {
  if (billingInterval === "weekly") {
    return (price * 52) / 12;
  }

  if (billingInterval === "yearly") {
    return price / 12;
  }

  return price;
}

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

function firstGrapheme(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if ("Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, {
      granularity: "grapheme",
    });

    for (const segment of segmenter.segment(trimmed)) {
      if (segment.segment.trim()) {
        return segment.segment;
      }
    }
  }

  return Array.from(trimmed)[0] ?? "";
}

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      return await getDashboardDataFn();
    } catch (err) {
      console.log(err);
      throw redirect({ to: "/login" });
    }
  },
  component: Home,
});

function Home() {
  const { subscriptions, categories } = Route.useLoaderData();
  const router = useRouter();
  const typedSubscriptions = subscriptions as Subscription[];
  const typedCategories = categories as Category[];
  const monthlyCost = typedSubscriptions.reduce(
    (sum: number, subscription: Subscription) =>
      sum + toMonthlyPrice(subscription.price, subscription.billingInterval),
    0,
  );
  const yearlyCost = typedSubscriptions.reduce(
    (sum: number, subscription: Subscription) => {
      if (subscription.billingInterval === "yearly") {
        return sum + subscription.price;
      }

      if (subscription.billingInterval === "weekly") {
        return sum + subscription.price * 52;
      }

      return sum + subscription.price * 12;
    },
    0,
  );
  const breakdownStats = typedSubscriptions
    .map((subscription: Subscription) => {
      const categoryName = subscription.category?.name ?? "Uncategorized";

      return {
        name: subscription.name,
        category: categoryName,
        color: seededHexColor(`subscription-${subscription.id}`),
        categoryColor: seededHexColor(`category-${categoryName}`),
        value: toMonthlyPrice(subscription.price, subscription.billingInterval),
      };
    })
    .sort((a, b) => b.value - a.value);

  async function handleCreateSubscription(formData: FormData) {
    const name = String(formData.get("name") ?? "").trim();
    const price = Number(formData.get("price"));
    const startedAt = String(formData.get("startedAt") ?? "").trim();
    const billingInterval = String(
      formData.get("billingInterval") ?? "",
    ).trim();
    const categoryValue = String(formData.get("categoryId") ?? "").trim();
    const categoryId = categoryValue ? Number(categoryValue) : null;

    if (
      !name ||
      !Number.isFinite(price) ||
      price <= 0 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(startedAt) ||
      !["monthly", "weekly", "yearly"].includes(billingInterval) ||
      (categoryId !== null &&
        (!Number.isInteger(categoryId) || categoryId <= 0))
    ) {
      return;
    }

    await createSubscriptionFn({
      data: {
        name,
        price,
        startedAt,
        billingInterval: billingInterval as "monthly" | "weekly" | "yearly",
        categoryId,
      },
    });
    await router.invalidate();
  }

  async function handleUpdateSubscription(formData: FormData) {
    const id = Number(formData.get("id"));
    const name = String(formData.get("name") ?? "").trim();
    const price = Number(formData.get("price"));
    const startedAt = String(formData.get("startedAt") ?? "").trim();
    const billingInterval = String(
      formData.get("billingInterval") ?? "",
    ).trim();
    const categoryValue = String(formData.get("categoryId") ?? "").trim();
    const categoryId = categoryValue ? Number(categoryValue) : null;

    if (
      !Number.isInteger(id) ||
      id <= 0 ||
      !name ||
      !Number.isFinite(price) ||
      price <= 0 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(startedAt) ||
      !["monthly", "weekly", "yearly"].includes(billingInterval) ||
      (categoryId !== null &&
        (!Number.isInteger(categoryId) || categoryId <= 0))
    ) {
      return;
    }

    await updateSubscriptionFn({
      data: {
        id,
        name,
        price,
        startedAt,
        billingInterval: billingInterval as "monthly" | "weekly" | "yearly",
        categoryId,
      },
    });
    await router.invalidate();
  }

  async function handleCreateCategory(formData: FormData) {
    const name = String(formData.get("name") ?? "").trim();
    const icon = firstGrapheme(String(formData.get("icon") ?? ""));

    if (!name || !icon) {
      return;
    }

    await createCategoryFn({
      data: { name, icon },
    });
    await router.invalidate();
  }

  async function handleDeleteSubscription(formData: FormData) {
    const id = Number(formData.get("id"));

    if (!Number.isInteger(id) || id <= 0) {
      return;
    }

    await deleteSubscriptionFn({
      data: { id },
    });
    await router.invalidate();
  }

  async function handleDeleteCategory(formData: FormData) {
    const id = Number(formData.get("id"));

    if (!Number.isInteger(id) || id <= 0) {
      return;
    }

    await deleteCategoryFn({
      data: { id },
    });
    await router.invalidate();
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 sm:py-10">
      <section id="stats">
        <StatsSection
          monthlyCost={monthlyCost}
          yearlyCost={yearlyCost}
          dailyCost={yearlyCost / 365}
          breakdownStats={breakdownStats}
          activeSubscriptions={subscriptions.length}
        />
      </section>
      <section className="w-full">
        <ActiveSubscriptions
          categories={typedCategories}
          createCategoryAction={handleCreateCategory}
          createSubscriptionAction={handleCreateSubscription}
          deleteCategoryAction={handleDeleteCategory}
          deleteSubscriptionAction={handleDeleteSubscription}
          subscriptions={typedSubscriptions}
          updateSubscriptionAction={handleUpdateSubscription}
        />
      </section>
    </main>
  );
}
