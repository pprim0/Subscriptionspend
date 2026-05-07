import { db } from "@subscriptionspend/db";
import * as schema from "@subscriptionspend/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

function buildCorsOrigins(): string[] {
  const rawOrigins = process.env.CORS_ORIGIN || "";
  return rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin);
}

function buildTrustedOrigins(): string[] {
  return Array.from(
    new Set([
      "http://localhost:3000",
      "http://localhost:3001",
      ...buildCorsOrigins(),
    ]),
  );
}

function buildCrossSubDomainCookiesConfig() {
  const rawDomain = process.env.BETTER_AUTH_COOKIE_DOMAIN?.trim();

  if (!rawDomain) {
    return undefined;
  }

  return {
    enabled: true,
    domain: rawDomain.replace(/^\./, ""),
  };
}

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:4000",
  emailAndPassword: {
    enabled: true,
    disableSignUp: process.env.DISABLE_SIGNUP === "true",
  },
  trustedOrigins: [...buildTrustedOrigins(), "http://localhost:4000"],
  advanced: {
    crossSubDomainCookies: buildCrossSubDomainCookiesConfig(),
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
