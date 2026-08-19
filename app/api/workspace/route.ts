import { get, put } from "@vercel/blob";
import { blobStorageConfigured, workspaceBlobPath } from "../../../lib/vercel-storage";

export const dynamic = "force-dynamic";

function actorEmail(request: Request) {
  return request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase() || "";
}

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Workspace storage is unavailable";
  return Response.json({ error: message }, { status: 503 });
}

type WorkspaceEnvelope = { state: Record<string, unknown>; updatedAt: string };

async function readWorkspace(): Promise<WorkspaceEnvelope | null> {
  if (!blobStorageConfigured()) throw new Error("Vercel Blob is not connected to this project");
  const result = await get(workspaceBlobPath, { access: "private", useCache: false });
  if (!result) return null;
  if (result.statusCode !== 200) throw new Error(`Workspace storage returned ${result.statusCode}`);
  return JSON.parse(await new Response(result.stream).text()) as WorkspaceEnvelope;
}

export async function GET(request: Request) {
  try {
    const record = await readWorkspace();
    return Response.json({ state: record?.state ?? null, updatedAt: record?.updatedAt ?? null, actor: actorEmail(request) || null, storage: "vercel-blob" });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json() as { state?: unknown };
    if (!payload.state || typeof payload.state !== "object") return Response.json({ error: "state is required" }, { status: 400 });
    const stateObject = payload.state as Record<string, unknown>;
    const state = JSON.stringify(stateObject);
    if (state.length > 750_000) return Response.json({ error: "workspace state is too large" }, { status: 413 });
    const updatedAt = new Date().toISOString(); const email = actorEmail(request);
    const existing = await readWorkspace();
    if (existing && email) {
      const current = existing.state;
      const users = Array.isArray(current.adminUsers) ? current.adminUsers as Array<{ email?: string; role?: string; status?: string }> : [];
      const actor = users.find((user) => user.email?.trim().toLowerCase() === email);
      if (users.length > 0 && !actor) return Response.json({ error: "workspace user is not registered" }, { status: 403 });
      if (actor?.status === "Suspended") return Response.json({ error: "workspace access is suspended" }, { status: 403 });
      const administrativeKeys = ["adminUsers", "workflowRules", "integrations", "adminSettings"];
      const adminChanged = administrativeKeys.some((key) => JSON.stringify(current[key]) !== JSON.stringify(stateObject[key]));
      if (adminChanged && actor && actor.role !== "Administrator") return Response.json({ error: "administrator access is required" }, { status: 403 });
    }
    await put(workspaceBlobPath, JSON.stringify({ state: stateObject, updatedAt }), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    });
    return Response.json({ saved: true, updatedAt, storage: "vercel-blob" });
  } catch (error) {
    return errorResponse(error);
  }
}
