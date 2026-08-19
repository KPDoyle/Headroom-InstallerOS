import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { installerWorkspaces } from "../../../db/schema";

export const dynamic = "force-dynamic";

function workspaceKey(request: Request) {
  return request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase() || "owner-workspace";
}

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Workspace storage is unavailable";
  return Response.json({ error: message }, { status: 503 });
}

export async function GET(request: Request) {
  try {
    const db = getDb();
    const [record] = await db.select().from(installerWorkspaces).where(eq(installerWorkspaces.workspaceKey, workspaceKey(request))).limit(1);
    return Response.json({ state: record ? JSON.parse(record.state) : null, updatedAt: record?.updatedAt ?? null });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json() as { state?: unknown };
    if (!payload.state || typeof payload.state !== "object") return Response.json({ error: "state is required" }, { status: 400 });
    const state = JSON.stringify(payload.state);
    if (state.length > 750_000) return Response.json({ error: "workspace state is too large" }, { status: 413 });
    const key = workspaceKey(request); const db = getDb(); const updatedAt = new Date().toISOString();
    await db.insert(installerWorkspaces).values({ workspaceKey: key, state, updatedAt }).onConflictDoUpdate({ target: installerWorkspaces.workspaceKey, set: { state, updatedAt } });
    return Response.json({ saved: true, updatedAt });
  } catch (error) {
    return errorResponse(error);
  }
}
