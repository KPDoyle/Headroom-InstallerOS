import { ensureSchema, getDatabase } from "../../../lib/database";
import { isPublicAccessEnabled } from "../../../lib/public-access";
import { isSupabaseConfigured } from "../../../lib/supabase/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const configured = isSupabaseConfigured();
  if (!configured) {
    const publicPreview = isPublicAccessEnabled();
    return Response.json({
      status: publicPreview ? "preview-local" : "configuration-required",
      app: "Headroom Installer OS",
      access: publicPreview ? "public-preview" : "authenticated",
      auth: publicPreview ? "disabled" : "not-configured",
      database: "not-configured",
      storage: publicPreview ? "browser-local" : "not-configured",
      territory: "postcodes.io",
      deployment: process.env.VERCEL_ENV ?? "local",
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    }, { status: publicPreview ? 200 : 503, headers: { "cache-control": "no-store" } });
  }

  try {
    await ensureSchema();
    const sql = getDatabase();
    await sql`select 1 as ready`;
    return Response.json({
      status: "ok",
      app: "Headroom Installer OS",
      access: isPublicAccessEnabled() ? "public-preview" : "authenticated",
      auth: "supabase-auth",
      database: "supabase-postgres",
      storage: "supabase-private-storage",
      territory: "postcodes.io",
      deployment: process.env.VERCEL_ENV ?? "local",
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (isPublicAccessEnabled()) {
      console.warn("[health] Supabase unavailable; public preview is using device-local persistence", error);
      return Response.json({
        status: "preview-local",
        app: "Headroom Installer OS",
        access: "public-preview",
        auth: "disabled",
        database: "unavailable",
        storage: "browser-local",
        territory: "postcodes.io",
        deployment: process.env.VERCEL_ENV ?? "local",
        commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
      }, { headers: { "cache-control": "no-store" } });
    }
    console.error("[health] Supabase readiness check failed", error);
    return Response.json({
      status: "degraded",
      app: "Headroom Installer OS",
      access: isPublicAccessEnabled() ? "public-preview" : "authenticated",
      auth: "supabase-auth",
      database: "unavailable",
      storage: "unavailable",
      territory: "postcodes.io",
      deployment: process.env.VERCEL_ENV ?? "local",
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
