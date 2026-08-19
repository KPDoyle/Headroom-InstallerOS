import { ensureSchema, getDatabase } from "../../../lib/database";
import { isSupabaseConfigured } from "../../../lib/supabase/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const configured = isSupabaseConfigured();
  if (!configured) {
    return Response.json({
      status: "configuration-required",
      app: "Headroom Installer OS",
      auth: "not-configured",
      database: "not-configured",
      storage: "not-configured",
      territory: "postcodes.io",
      deployment: process.env.VERCEL_ENV ?? "local",
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    }, { status: 503, headers: { "cache-control": "no-store" } });
  }

  try {
    await ensureSchema();
    const sql = getDatabase();
    await sql`select 1 as ready`;
    return Response.json({
      status: "ok",
      app: "Headroom Installer OS",
      auth: "supabase-auth",
      database: "supabase-postgres",
      storage: "supabase-private-storage",
      territory: "postcodes.io",
      deployment: process.env.VERCEL_ENV ?? "local",
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("[health] Supabase readiness check failed", error);
    return Response.json({
      status: "degraded",
      app: "Headroom Installer OS",
      auth: "supabase-auth",
      database: "unavailable",
      storage: "unavailable",
      territory: "postcodes.io",
      deployment: process.env.VERCEL_ENV ?? "local",
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
