import { authErrorResponse, requireAdministrator, writeAuditEvent } from "../../../../../lib/auth";
import { isUserRole, type UserRole, type UserStatus } from "../../../../../lib/auth-types";
import { getDatabase } from "../../../../../lib/database";
import { PUBLIC_ACCESS_VIEWER_ID } from "../../../../../lib/public-access";
import { createAdminClient } from "../../../../../lib/supabase/admin";

type RouteProps = { params: Promise<{ id: string }> };
type ProfileRow = { id: string; full_name: string; email: string; role: UserRole; status: UserStatus; last_active_at: string | null };

function adminUser(profile: ProfileRow) {
  return {
    id: profile.id,
    name: profile.full_name,
    email: profile.email,
    role: profile.role,
    status: profile.status,
    lastActive: profile.status === "Invited"
      ? "Invitation pending"
      : profile.last_active_at
        ? new Date(profile.last_active_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
        : "Not yet active",
  };
}

export async function PATCH(request: Request, { params }: RouteProps) {
  try {
    const viewer = await requireAdministrator();
    const { id } = await params;
    if (id === PUBLIC_ACCESS_VIEWER_ID) {
      return Response.json({ error: "Public preview access is managed by the deployment setting" }, { status: 400 });
    }
    const payload = await request.json() as { role?: unknown; status?: unknown; action?: unknown };
    const sql = getDatabase();
    const existingRows = await sql<ProfileRow[]>`
      select id, full_name, email, role, status, last_active_at
      from public.profiles
      where id = ${id} and organisation_id = ${viewer.organisationId}
      limit 1
    `;
    const existing = existingRows[0];
    if (!existing) return Response.json({ error: "Workspace user not found" }, { status: 404 });

    if (payload.action === "resend") {
      const redirectTo = `${new URL(request.url).origin}/auth/confirm?next=/`;
      const { error } = await createAdminClient().auth.admin.inviteUserByEmail(existing.email, {
        redirectTo,
        data: { full_name: existing.full_name, headroom_role: existing.role, organisation_id: viewer.organisationId },
      });
      if (error) return Response.json({ error: error.message }, { status: 502 });
      await writeAuditEvent(viewer, "Invitation resent", `${existing.full_name} · ${existing.email}`, "Access");
      return Response.json({ user: adminUser(existing), resent: true });
    }

    const role = payload.role === undefined ? existing.role : isUserRole(payload.role) ? payload.role : null;
    const status = payload.status === undefined
      ? existing.status
      : payload.status === "Active" || payload.status === "Invited" || payload.status === "Suspended"
        ? payload.status
        : null;
    if (!role || !status) return Response.json({ error: "Invalid role or status" }, { status: 400 });
    if (id === viewer.id && status === "Suspended") {
      return Response.json({ error: "You cannot suspend your own administrator account" }, { status: 400 });
    }
    if (existing.role === "Administrator" && role !== "Administrator") {
      const adminTotals = await sql<{ count: number }[]>`
        select count(*)::int as count from public.profiles
        where organisation_id = ${viewer.organisationId} and role = 'Administrator' and status <> 'Suspended'
      `;
      if ((adminTotals[0]?.count ?? 0) <= 1) {
        return Response.json({ error: "At least one active administrator is required" }, { status: 400 });
      }
    }

    const profiles = await sql<ProfileRow[]>`
      update public.profiles
      set role = ${role}, status = ${status}, updated_at = now()
      where id = ${id} and organisation_id = ${viewer.organisationId}
      returning id, full_name, email, role, status, last_active_at
    `;
    await createAdminClient().auth.admin.updateUserById(id, {
      app_metadata: { headroom_role: role, headroom_status: status, organisation_id: viewer.organisationId },
    });
    const changes = [role !== existing.role ? `role ${existing.role} → ${role}` : "", status !== existing.status ? `status ${existing.status} → ${status}` : ""].filter(Boolean).join(" · ");
    await writeAuditEvent(viewer, "Workspace user updated", `${existing.full_name} · ${changes || "profile refreshed"}`, "Access");
    return Response.json({ user: adminUser(profiles[0]) });
  } catch (error) {
    return authErrorResponse(error);
  }
}
