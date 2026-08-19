import { authErrorResponse, requireAdministrator, writeAuditEvent } from "../../../../lib/auth";
import { isUserRole, type UserRole, type UserStatus } from "../../../../lib/auth-types";
import { getDatabase } from "../../../../lib/database";
import { createAdminClient } from "../../../../lib/supabase/admin";

export const dynamic = "force-dynamic";

type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  last_active_at: string | null;
};

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

export async function GET() {
  try {
    const viewer = await requireAdministrator();
    const sql = getDatabase();
    const profiles = await sql<ProfileRow[]>`
      select id, full_name, email, role, status, last_active_at
      from public.profiles
      where organisation_id = ${viewer.organisationId}
      order by created_at asc
    `;
    return Response.json({ users: profiles.map(adminUser) }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const viewer = await requireAdministrator();
    const payload = await request.json() as { name?: unknown; email?: unknown; role?: unknown };
    const name = typeof payload.name === "string" ? payload.name.trim() : "";
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    const role = isUserRole(payload.role) ? payload.role : "Installer";
    if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
      return Response.json({ error: "A valid name and email address are required" }, { status: 400 });
    }

    const sql = getDatabase();
    const existing = await sql<{ id: string }[]>`
      select id from public.profiles
      where organisation_id = ${viewer.organisationId} and lower(email) = ${email}
      limit 1
    `;
    if (existing[0]) return Response.json({ error: "That email already belongs to this workspace" }, { status: 409 });

    const redirectTo = `${new URL(request.url).origin}/auth/confirm?next=/`;
    const supabase = createAdminClient();
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: { full_name: name, headroom_role: role, organisation_id: viewer.organisationId },
    });
    if (error || !data.user) {
      return Response.json({ error: error?.message || "Supabase could not create the invitation" }, { status: 502 });
    }

    const profiles = await sql<ProfileRow[]>`
      insert into public.profiles (
        id, organisation_id, full_name, email, role, status, invited_by
      ) values (
        ${data.user.id}, ${viewer.organisationId}, ${name}, ${email}, ${role}, 'Invited', ${viewer.id}
      )
      on conflict (id) do update
      set organisation_id = excluded.organisation_id, full_name = excluded.full_name,
        email = excluded.email, role = excluded.role, status = 'Invited',
        invited_by = excluded.invited_by, updated_at = now()
      returning id, full_name, email, role, status, last_active_at
    `;
    await writeAuditEvent(viewer, "User invited", `${name} · ${role} · ${email}`, "Access");
    return Response.json({ user: adminUser(profiles[0]) }, { status: 201 });
  } catch (error) {
    return authErrorResponse(error);
  }
}

