import { injectable } from "tsyringe";
import type {
  CreateSubscriptionInput,
  RemoveSubscriptionInput,
  UpdateSubscriptionInput,
} from "./subcriptions.types";
import type { SubscriptionRepo } from "./subscriptions.repo";

function toMonthlyCost(
  price: number,
  billingInterval: "monthly" | "weekly" | "yearly",
) {
  if (billingInterval === "weekly") {
    return (price * 52) / 12;
  }

  if (billingInterval === "yearly") {
    return price / 12;
  }

  return price;
}

export function normalizeMonthlyPrice(
  price: number,
  billingInterval: "monthly" | "weekly" | "yearly",
) {
  return toMonthlyCost(price, billingInterval);
}

@injectable()
export class SubscriptionService {
  constructor(private readonly repo: SubscriptionRepo) {}

  async findAll(userId: string) {
    const subscriptions = await this.repo.findAll(userId);

    return subscriptions.map((subscription) => ({
      ...subscription,
      category:
        subscription.category?.id == null
          ? null
          : {
              id: subscription.category.id,
              name: subscription.category.name,
              icon: subscription.category.icon,
            },
    }));
  }

  async calculateStats(userId: string) {
    const subscriptions = await this.repo.calculateStats(userId);
    const monthlyCost = subscriptions.reduce(
      (sum, subscription) =>
        sum +
        toMonthlyCost(
          subscription.price,
          subscription.billingInterval ?? "monthly",
        ),
      0,
    );

    return {
      averagePerSub:
        subscriptions.length === 0 ? 0 : monthlyCost / subscriptions.length,
      dailyCost: monthlyCost / 30,
    };
  }

  async calculateMonthlyCosts(userId: string) {
    const subscriptions = await this.findAll(userId);

    return subscriptions.map((subscription) => ({
      id: subscription.id,
      name: subscription.name,
      price: subscription.price,
      startedAt: subscription.startedAt,
      billingInterval: subscription.billingInterval,
      billingDay: subscription.billingDay,
      billingMonth: subscription.billingMonth,
      billingScheduleConfirmed: subscription.billingScheduleConfirmed,
      monthlyPrice: normalizeMonthlyPrice(
        subscription.price,
        subscription.billingInterval ?? "monthly",
      ),
    }));
  }

  create(userId: string, input: CreateSubscriptionInput) {
    return this.repo.create(userId, input);
  }

  update(userId: string, input: UpdateSubscriptionInput) {
    return this.repo.update(userId, input);
  }

  remove(userId: string, input: RemoveSubscriptionInput) {
    return this.repo.remove(userId, input.id);
  }
}
