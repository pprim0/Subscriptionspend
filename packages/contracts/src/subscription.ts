import { oc } from "@orpc/contract";
import { z } from "zod";
import { categorySchema } from "./category";

const billingIntervalSchema = z.enum(["monthly", "weekly", "yearly"]);
const isoDateSchema = z.iso.date();
const billingScheduleInputSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  startedAt: isoDateSchema,
  billingInterval: billingIntervalSchema,
  categoryId: z.number().int().positive().nullable(),
});

const subscriptionSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  startedAt: isoDateSchema,
  billingInterval: billingIntervalSchema,
  billingDay: z.number().int().min(1).max(31),
  billingMonth: z.number().int().min(1).max(12).nullable(),
  billingScheduleConfirmed: z.boolean(),
  category: categorySchema.nullable(),
});

export const subscriptionContract = {
  all: oc
    .route({ method: "GET", path: "/subscriptions" })
    .output(z.array(subscriptionSchema)),
  monthlyCosts: oc
    .route({ method: "GET", path: "/subscriptions/monthly-costs" })
    .output(
      z.array(
        z.object({
          id: z.number(),
          name: z.string(),
          price: z.number(),
          startedAt: isoDateSchema,
          billingInterval: billingIntervalSchema,
          billingDay: z.number().int().min(1).max(31),
          billingMonth: z.number().int().min(1).max(12).nullable(),
          billingScheduleConfirmed: z.boolean(),
          monthlyPrice: z.number(),
        }),
      ),
    ),
  stats: oc
    .route({ method: "GET", path: "/subscriptions/stats" })
    .output(z.object({ averagePerSub: z.number(), dailyCost: z.number() })),
  create: oc
    .route({ method: "POST", path: "/subscriptions" })
    .input(billingScheduleInputSchema)
    .output(subscriptionSchema),
  update: oc
    .route({ method: "PATCH", path: "/subscriptions/{id}" })
    .input(
      billingScheduleInputSchema.extend({
        id: z.number().int().positive(),
      }),
    )
    .output(subscriptionSchema),
  remove: oc
    .route({ method: "DELETE", path: "/subscriptions/{id}" })
    .input(z.object({ id: z.number().int().positive() }))
    .output(z.object({ success: z.literal(true) })),
};
