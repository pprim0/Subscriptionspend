export type BillingInterval = "monthly" | "weekly" | "yearly";

export type Subscription = {
  id: number;
  name: string;
  price: number;
  startedAt: string;
  billingInterval: BillingInterval;
  billingDay: number;
  billingMonth: number | null;
  billingScheduleConfirmed: boolean;
  category: {
    id: number;
    name: string;
    icon: string;
  } | null;
};

export type CreateSubscriptionInput = {
  name: string;
  price: number;
  startedAt: string;
  billingInterval: BillingInterval;
  categoryId: number | null;
};

export type RemoveSubscriptionInput = {
  id: number;
};

export type UpdateSubscriptionInput = {
  id: number;
  name: string;
  price: number;
  startedAt: string;
  billingInterval: BillingInterval;
  categoryId: number | null;
};

export interface ISubscriptionRepo {
  findAll(): Promise<Subscription[]>;
}
