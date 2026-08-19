import postgres from "postgres";
import { getDatabaseUrl } from "./supabase/config";
import { SCHEMA_SQL } from "./schema";

let database: ReturnType<typeof postgres> | null = null;
let schemaPromise: Promise<void> | null = null;

export function getDatabase() {
  database ??= postgres(getDatabaseUrl(), {
    max: 3,
    idle_timeout: 20,
    connect_timeout: 15,
    prepare: false,
    ssl: "require",
  });
  return database;
}

export async function ensureSchema() {
  schemaPromise ??= getDatabase().unsafe(SCHEMA_SQL).then(() => undefined).catch((error) => {
    schemaPromise = null;
    throw error;
  });
  await schemaPromise;
}

