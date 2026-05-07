import { categories, db, subscriptions } from "@subscriptionspend/db";
import { and, eq } from "drizzle-orm";
import { injectable } from "tsyringe";
import type { CreateSubscriptionInput } from "./subcriptions.types";

function deriveBillingSchedule(
  startedAt: string,
  billingInterval: CreateSubscriptionInput["billingInterval"],
) {
  const date = new Date(`${startedAt}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid start date");
  }

  const billingDay =
    billingInterval === "weekly"
      ? ((date.getDay() + 6) % 7) + 1
      : date.getDate();
  const billingMonth =
    billingInterval === "yearly" ? date.getMonth() + 1 : null;

  return { billingDay, billingMonth };
}

@injectable()
export class SubscriptionRepo {
  findAll(userId: string) {
    return db
      .select({
        id: subscriptions.id,
        name: subscriptions.name,
        price: subscriptions.price,
        startedAt: subscriptions.startedAt,
        billingInterval: subscriptions.billingInterval,
        billingDay: subscriptions.billingDay,
        billingMonth: subscriptions.billingMonth,
        billingScheduleConfirmed: subscriptions.billingScheduleConfirmed,
        category: {
          id: categories.id,
          name: categories.name,
          icon: categories.icon,
        },
      })
      .from(subscriptions)
      .leftJoin(categories, eq(subscriptions.categoryId, categories.id))
      .where(eq(subscriptions.userId, userId));
  }

  calculateStats(userId: string) {
    return db
      .select({
        price: subscriptions.price,
        startedAt: subscriptions.startedAt,
        billingInterval: subscriptions.billingInterval,
        billingDay: subscriptions.billingDay,
        billingMonth: subscriptions.billingMonth,
        billingScheduleConfirmed: subscriptions.billingScheduleConfirmed,
      })
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));
  }

  findCategoryById(userId: string, categoryId: number) {
    return db
      .select({
        id: categories.id,
        name: categories.name,
        icon: categories.icon,
      })
      .from(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)));
  }

  async create(userId: string, input: CreateSubscriptionInput) {
    const { billingDay, billingMonth } = deriveBillingSchedule(
      input.startedAt,
      input.billingInterval,
    );
    let categoryId: number | null = null;

    if (input.categoryId !== null) {
      const [category] = await this.findCategoryById(userId, input.categoryId);

      if (!category) {
        throw new Error("Invalid category");
      }

      categoryId = category.id;
    }

    const [subscription] = await db
      .insert(subscriptions)
      .values({
        userId,
        name: input.name,
        price: input.price,
        startedAt: input.startedAt,
        billingInterval: input.billingInterval,
        billingDay,
        billingMonth,
        billingScheduleConfirmed: true,
        categoryId,
      })
      .returning({
        id: subscriptions.id,
        name: subscriptions.name,
        price: subscriptions.price,
        startedAt: subscriptions.startedAt,
        billingInterval: subscriptions.billingInterval,
        billingDay: subscriptions.billingDay,
        billingMonth: subscriptions.billingMonth,
        billingScheduleConfirmed: subscriptions.billingScheduleConfirmed,
        categoryId: subscriptions.categoryId,
      });

    if (!subscription) {
      throw new Error("Failed to create subscription");
    }

    if (subscription.categoryId == null) {
      return {
        id: subscription.id,
        name: subscription.name,
        price: subscription.price,
        startedAt: subscription.startedAt,
        billingInterval: subscription.billingInterval,
        billingDay: subscription.billingDay,
        billingMonth: subscription.billingMonth,
        billingScheduleConfirmed: subscription.billingScheduleConfirmed,
        category: null,
      };
    }

    const [category] = await this.findCategoryById(
      userId,
      subscription.categoryId,
    );

    return {
      id: subscription.id,
      name: subscription.name,
      price: subscription.price,
      startedAt: subscription.startedAt,
      billingInterval: subscription.billingInterval,
      billingDay: subscription.billingDay,
      billingMonth: subscription.billingMonth,
      billingScheduleConfirmed: subscription.billingScheduleConfirmed,
      category: category ?? null,
    };
  }

  async update(
    userId: string,
    input: CreateSubscriptionInput & { id: number },
  ) {
    const { billingDay, billingMonth } = deriveBillingSchedule(
      input.startedAt,
      input.billingInterval,
    );
    let categoryId: number | null = null;

    if (input.categoryId !== null) {
      const [category] = await this.findCategoryById(userId, input.categoryId);

      if (!category) {
        throw new Error("Invalid category");
      }

      categoryId = category.id;
    }

    const [subscription] = await db
      .update(subscriptions)
      .set({
        name: input.name,
        price: input.price,
        startedAt: input.startedAt,
        billingInterval: input.billingInterval,
        billingDay,
        billingMonth,
        billingScheduleConfirmed: true,
        categoryId,
      })
      .where(
        and(eq(subscriptions.id, input.id), eq(subscriptions.userId, userId)),
      )
      .returning({
        id: subscriptions.id,
        name: subscriptions.name,
        price: subscriptions.price,
        startedAt: subscriptions.startedAt,
        billingInterval: subscriptions.billingInterval,
        billingDay: subscriptions.billingDay,
        billingMonth: subscriptions.billingMonth,
        billingScheduleConfirmed: subscriptions.billingScheduleConfirmed,
        categoryId: subscriptions.categoryId,
      });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    if (subscription.categoryId == null) {
      return {
        id: subscription.id,
        name: subscription.name,
        price: subscription.price,
        startedAt: subscription.startedAt,
        billingInterval: subscription.billingInterval,
        billingDay: subscription.billingDay,
        billingMonth: subscription.billingMonth,
        billingScheduleConfirmed: subscription.billingScheduleConfirmed,
        category: null,
      };
    }

    const [category] = await this.findCategoryById(
      userId,
      subscription.categoryId,
    );

    return {
      id: subscription.id,
      name: subscription.name,
      price: subscription.price,
      startedAt: subscription.startedAt,
      billingInterval: subscription.billingInterval,
      billingDay: subscription.billingDay,
      billingMonth: subscription.billingMonth,
      billingScheduleConfirmed: subscription.billingScheduleConfirmed,
      category: category ?? null,
    };
  }

  async remove(userId: string, id: number) {
    const result = await db
      .delete(subscriptions)
      .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, userId)))
      .returning({ id: subscriptions.id });

    if (result.length === 0) {
      throw new Error("Subscription not found");
    }

    return { success: true as const };
  }
}
