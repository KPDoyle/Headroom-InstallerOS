import type { UserRole, UserStatus, Viewer } from "../../../lib/auth-types";
import type postgres from "postgres";
import { authErrorResponse, requireViewer, writeAuditEvent } from "../../../lib/auth";
import { getDatabase } from "../../../lib/database";

export const dynamic = "force-dynamic";

type WorkspaceEnvelope = { state: Record<string, unknown>; updated_at: string };
type AuditRow = { id: string; actor_name: string; category: string; action: string; detail: string; created_at: string };
type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  last_active_at: string | null;
  created_at: string;
};

function profileToAdminUser(profile: ProfileRow) {
  const lastActive = profile.status === "Invited"
    ? "Invitation pending"
    : profile.last_active_at
      ? new Date(profile.last_active_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
      : "Not yet active";
  return {
    id: profile.id,
    name: profile.full_name,
    email: profile.email,
    role: profile.role,
    status: profile.status,
    lastActive,
  };
}

async function organisationUsers(viewer: Viewer) {
  const sql = getDatabase();
  const profiles = await sql<ProfileRow[]>`
    select id, full_name, email, role, status, last_active_at, created_at
    from public.profiles
    where organisation_id = ${viewer.organisationId}
    order by created_at asc
  `;
  return profiles.map(profileToAdminUser);
}

export async function GET() {
  try {
    const viewer = await requireViewer();
    const sql = getDatabase();
    const [records, adminUsers, auditEvents] = await Promise.all([
      sql<WorkspaceEnvelope[]>`
        select state, updated_at from public.workspaces
        where organisation_id = ${viewer.organisationId}
        limit 1
      `,
      organisationUsers(viewer),
      sql<AuditRow[]>`
        select id, actor_name, category, action, detail, created_at
        from public.audit_events
        where organisation_id = ${viewer.organisationId}
        order by created_at desc
        limit 250
      `,
    ]);
    const record = records[0];
    const storedAudit = Array.isArray(record?.state?.auditLog) ? record.state.auditLog : [];
    const serverAudit = auditEvents.map((event) => ({
      id: event.id,
      actor: event.actor_name,
      category: event.category,
      action: event.action,
      detail: event.detail,
      at: event.created_at,
    }));
    const auditLog = [...serverAudit, ...storedAudit]
      .filter((entry, index, entries) => entry && typeof entry === "object" && entries.findIndex((candidate) => (
        candidate && typeof candidate === "object" && "id" in candidate && "id" in entry && candidate.id === entry.id
      )) === index)
      .slice(0, 250);
    const state = record?.state && typeof record.state === "object"
      ? { ...record.state, adminUsers, auditLog }
      : null;
    return Response.json({
      state,
      updatedAt: record?.updated_at ?? null,
      viewer,
      storage: "supabase-postgres",
    }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const viewer = await requireViewer();
    if (viewer.role === "Auditor") {
      return Response.json({ error: "Auditor access is read-only" }, { status: 403 });
    }

    const payload = await request.json() as { state?: unknown };
    if (!payload.state || typeof payload.state !== "object" || Array.isArray(payload.state)) {
      return Response.json({ error: "state is required" }, { status: 400 });
    }
    const stateObject = payload.state as Record<string, unknown>;
    const serialised = JSON.stringify(stateObject);
    if (serialised.length > 750_000) {
      return Response.json({ error: "workspace state is too large" }, { status: 413 });
    }

    const sql = getDatabase();
    const currentRows = await sql<{ state: Record<string, unknown> }[]>`
      select state from public.workspaces where organisation_id = ${viewer.organisationId}
    `;
    const current = currentRows[0]?.state ?? {};
    const stateToPersist = { ...stateObject };
    delete stateToPersist.adminUsers;
    if (viewer.role !== "Administrator") {
      for (const key of ["workflowRules", "integrations", "adminSettings"]) {
        if (key in current) stateToPersist[key] = current[key];
        else delete stateToPersist[key];
      }
    }

    const rows = await sql<{ updated_at: string }[]>`
      insert into public.workspaces (organisation_id, state, updated_by, updated_at)
      values (${viewer.organisationId}, ${sql.json(stateToPersist as postgres.JSONValue)}, ${viewer.id}, now())
      on conflict (organisation_id) do update
      set state = excluded.state, updated_by = excluded.updated_by, updated_at = now()
      returning updated_at
    `;
    if (!currentRows[0]) {
      await writeAuditEvent(viewer, "Workspace initialised", "Organisation workspace created", "Data");
    }
    return Response.json({ saved: true, updatedAt: rows[0]?.updated_at, storage: "supabase-postgres" });
  } catch (error) {
    return authErrorResponse(error);
  }
}
