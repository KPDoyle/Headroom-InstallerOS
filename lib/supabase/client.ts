import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "./config";

let browserClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  const config = getSupabasePublicConfig();
  if (!config) throw new Error("Supabase is not configured");
  browserClient ??= createBrowserClient(config.url, config.publishableKey);
  return browserClient;
}
