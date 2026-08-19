import type { User } from "@supabase/supabase-js";
import { ensureSchema, getDatabase } from "./database";
import type { UserRole, UserStatus, Viewer } from "./auth-types";
import {
  createPublicViewer,
  isPublicAccessEnabled,
  isPublicAccessViewer,
  PUBLIC_ACCESS_ORGANISATION_ID,
} from "./public-access";
import { createClient } from "./supabase/server";

type ProfileRow = {
  id: string;
  organisation_id: string;
  organisation_name: string;
  full_name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};

export class ViewerAccessError extends Error {
  constructor(public readonly code: "not-provisioned" | "suspended" | "access-unavailable", message: string) {
    super(message);
    this.name = "ViewerAccessError";
  }
}

function toViewer(profile: ProfileRow): Viewer {
  return {
    id: profile.id,
    organisationId: profile.organisation_id,
    organisationName: profile.organisation_name,
    fullName: profile.full_name,
    email: profile.email,
    role: profile.role,
    status: profile.status,
  };
}

async function findProfile(userId: string) {
  const sql = getDatabase();
  const rows = await sql<ProfileRow[]>`
    select p.id, p.organisation_id, o.name as organisation_name, p.full_name,
      p.email, p.role, p.status
    from public.profiles p
    join public.organisations o on o.id = p.organisation_id
    where p.id = ${userId}
    limit 1
  `;
  return rows[0] ?? null;
}

async function publicViewer() {
  const sql = getDatabase();
  const organisation = await sql.begin(async (transaction) => {
    await transaction`select pg_advisory_xact_lock(hashtext('headroom-public-preview'))`;
    const existing = await transaction<{ id: string; name: string }[]>`
      select id, name from public.organisations order by created_at asc limit 1
    `;
    if (existing[0]) return existing[0];
    const created = await transaction<{ id: string; name: string }[]>`
      insert into public.organisations (id, name)
      values (${PUBLIC_ACCESS_ORGANISATION_ID}, 'Headroom Installer Organisation')
      returning id, name
    `;
    return created[0];
  });
  if (!organisation) {
    throw new ViewerAccessError("access-unavailable", "Public preview workspace could not be initialised");
  }
  return createPublicViewer(organisation.id, organisation.name);
}

function userDisplayName(user: User) {
  const metadataName = user.user_metadata?.full_name || user.user_metadata?.name;
  return typeof metadataName === "string" && metadataName.trim()
    ? metadataName.trim()
    : (user.email?.split("@")[0] || "Workspace administrator");
}

async function bootstrapFirstAdministrator(user: User) {
  const sql = getDatabase();
  return sql.begin(async (transaction) => {
    await transaction`select pg_advisory_xact_lock(hashtext('headroom-first-administrator'))`;

    const existing = await transaction<ProfileRow[]>`
      select p.id, p.organisation_id, o.name as organisation_name, p.full_name,
        p.email, p.role, p.status
      from public.profiles p
      join public.organisations o on o.id = p.organisation_id
      where p.id = ${user.id}
      limit 1
    `;
    if (existing[0]) return existing[0];

    const totals = await transaction<{ count: number }[]>`
      select count(*)::int as count from public.profiles
    `;
    if ((totals[0]?.count ?? 0) > 0) {
      throw new ViewerAccessError("not-provisioned", "This account has not been invited to the installer workspace");
    }

    const organisationName =
      typeof user.user_metadata?.organisation_name === "string" && user.user_metadata.organisation_name.trim()
        ? user.user_metadata.organisation_name.trim()
        : "Headroom Installer Organisation";
    const existingOrganisations = await transaction<{ id: string; name: string }[]>`
      select id, name from public.organisations order by created_at asc limit 1
    `;
    const organisations = existingOrganisations[0]
      ? existingOrganisations
      : await transaction<{ id: string; name: string }[]>`
          insert into public.organisations (name, created_by)
          values (${organisationName}, ${user.id})
          returning id, name
        `;
    const organisation = organisations[0];
    if (!organisation) {
      throw new ViewerAccessError("access-unavailable", "Workspace organisation could not be created");
    }
    const fullName = userDisplayName(user);
    const email = user.email?.trim().toLowerCase() || "administrator@installer.local";
    const profiles = await transaction<ProfileRow[]>`
      insert into public.profiles (
        id, organisation_id, full_name, email, role, status, last_active_at
      ) values (
        ${user.id}, ${organisation.id}, ${fullName}, ${email}, 'Administrator', 'Active', now()
      )
      returning id, organisation_id, ${organisation.name}::text as organisation_name,
        full_name, email, role, status
    `;
    return profiles[0];
  });
}

export async function getViewer(): Promise<Viewer | null> {
  await ensureSchema();
  if (isPublicAccessEnabled()) return publicViewer();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  let profile = await findProfile(data.user.id);
  if (!profile) profile = await bootstrapFirstAdministrator(data.user);
  if (!profile) throw new ViewerAccessError("access-unavailable", "Workspace profile could not be loaded");
  if (profile.status === "Suspended") {
    throw new ViewerAccessError("suspended", "This workspace account is suspended");
  }

  const sql = getDatabase();
  if (profile.status === "Invited") {
    await sql`
      update public.profiles
      set status = 'Active', last_active_at = now(), updated_at = now()
      where id = ${profile.id}
    `;
    profile = { ...profile, status: "Active" };
  } else {
    await sql`update public.profiles set last_active_at = now(), updated_at = now() where id = ${profile.id}`;
  }
  return toViewer(profile);
}

export async function requireViewer() {
  const viewer = await getViewer();
  if (!viewer) throw new ViewerAccessError("not-provisioned", "Authentication is required");
  return viewer;
}

export async function requireAdministrator() {
  const viewer = await requireViewer();
  if (viewer.role !== "Administrator") {
    throw new ViewerAccessError("not-provisioned", "Administrator access is required");
  }
  return viewer;
}

export async function writeAuditEvent(
  viewer: Viewer,
  action: string,
  detail: string,
  category = "Administration",
) {
  const sql = getDatabase();
  const actorId = isPublicAccessViewer(viewer) ? null : viewer.id;
  await sql`
    insert into public.audit_events (
      organisation_id, actor_id, actor_name, category, action, detail
    ) values (
      ${viewer.organisationId}, ${actorId}, ${viewer.fullName}, ${category}, ${action}, ${detail}
    )
  `;
}

export function authErrorResponse(error: unknown) {
  if (error instanceof ViewerAccessError) {
    const status = error.message === "Authentication is required" ? 401 : 403;
    return Response.json({ error: error.message, code: error.code }, { status });
  }
  console.error("[auth] request failed", error);
  return Response.json({ error: "Workspace access is temporarily unavailable" }, { status: 503 });
}
