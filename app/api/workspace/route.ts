import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { installerWorkspaces } from "../../../db/schema";

export const dynamic = "force-dynamic";

const organisationKey = "headroom-installer-os-primary";

function actorEmail(request: Request) {
  return request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase() || "";
}

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Workspace storage is unavailable";
  return Response.json({ error: message }, { status: 503 });
}

export async function GET(request: Request) {
  try {
    const db = getDb();
    let [record] = await db.select().from(installerWorkspaces).where(eq(installerWorkspaces.workspaceKey, organisationKey)).limit(1);
    const email = actorEmail(request);
    if (!record && email) {
      const [personalRecord] = await db.select().from(installerWorkspaces).where(eq(installerWorkspaces.workspaceKey, email)).limit(1);
      if (personalRecord) {
        await db.insert(installerWorkspaces).values({ workspaceKey: organisationKey, state: personalRecord.state, updatedAt: personalRecord.updatedAt }).onConflictDoNothing();
        record = personalRecord;
      }
    }
    return Response.json({ state: record ? JSON.parse(record.state) : null, updatedAt: record?.updatedAt ?? null, actor: email || null });
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
    const db = getDb(); const updatedAt = new Date().toISOString(); const email = actorEmail(request);
    const [existing] = await db.select().from(installerWorkspaces).where(eq(installerWorkspaces.workspaceKey, organisationKey)).limit(1);
    if (existing && email) {
      const current = JSON.parse(existing.state) as Record<string, unknown>;
      const users = Array.isArray(current.adminUsers) ? current.adminUsers as Array<{ email?: string; role?: string; status?: string }> : [];
      const actor = users.find((user) => user.email?.trim().toLowerCase() === email);
      if (users.length > 0 && !actor) return Response.json({ error: "workspace user is not registered" }, { status: 403 });
      if (actor?.status === "Suspended") return Response.json({ error: "workspace access is suspended" }, { status: 403 });
      const administrativeKeys = ["adminUsers", "workflowRules", "integrations", "adminSettings"];
      const adminChanged = administrativeKeys.some((key) => JSON.stringify(current[key]) !== JSON.stringify(stateObject[key]));
      if (adminChanged && actor && actor.role !== "Administrator") return Response.json({ error: "administrator access is required" }, { status: 403 });
    }
    await db.insert(installerWorkspaces).values({ workspaceKey: organisationKey, state, updatedAt }).onConflictDoUpdate({ target: installerWorkspaces.workspaceKey, set: { state, updatedAt } });
    return Response.json({ saved: true, updatedAt });
  } catch (error) {
    return errorResponse(error);
  }
}
