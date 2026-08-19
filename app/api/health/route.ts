import { blobStorageConfigured } from "../../../lib/vercel-storage";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    status: "ok",
    app: "Headroom Installer OS",
    storage: blobStorageConfigured() ? "vercel-blob" : "local-fallback",
    territory: "postcodes.io",
    deployment: process.env.VERCEL_ENV ?? "local",
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
  }, { headers: { "cache-control": "no-store" } });
}
