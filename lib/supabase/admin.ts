import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig, getSupabaseSecretKey } from "./config";

let adminClient: ReturnType<typeof createClient> | null = null;

export function createAdminClient() {
  const config = getSupabasePublicConfig();
  if (!config) throw new Error("Supabase is not configured");
  adminClient ??= createClient(config.url, getSupabaseSecretKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return adminClient;
}

