import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "drizzle-kit";

const dbDir = dirname(fileURLToPath(import.meta.url));
const databaseUrl =
  process.env.DATABASE_URL?.trim() ||
  "postgres://postgres:postgres@localhost:5432/subscriptionspend";

export default defineConfig({
  schema: path.join(dbDir, "./src/schema/index.ts"),
  out: path.join(dbDir, "./migrations"),
  dialect: "postgresql",
  strict: true,
  verbose: true,
  dbCredentials: { url: databaseUrl },
});
