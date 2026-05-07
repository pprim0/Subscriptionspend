import {
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  real,
  serial,
  text,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { categories } from "./categories";

export const billingIntervalEnum = ["monthly", "weekly", "yearly"] as const;
export const billingInterval = pgEnum("billing_interval", billingIntervalEnum);

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  price: real("price").notNull(),
  startedAt: date("startedAt", { mode: "string" }).notNull(),
  billingInterval: billingInterval("billingInterval")
    .notNull()
    .default("monthly"),
  billingDay: integer("billingDay").notNull().default(1),
  billingMonth: integer("billingMonth"),
  billingScheduleConfirmed: boolean("billingScheduleConfirmed")
    .notNull()
    .default(false),
  categoryId: integer("categoryId").references(() => categories.id, {
    onDelete: "set null",
  }),
});
