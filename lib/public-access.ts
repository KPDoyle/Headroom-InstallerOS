import type { Viewer } from "./auth-types";

export const PUBLIC_ACCESS_VIEWER_ID = "public-preview";
export const PUBLIC_ACCESS_ORGANISATION_ID = "00000000-0000-4000-8000-000000000001";

export function isPublicAccessEnabled() {
  return process.env.HEADROOM_REQUIRE_LOGIN !== "true";
}

export function createPublicViewer(organisationId: string, organisationName: string): Viewer {
  return {
    id: PUBLIC_ACCESS_VIEWER_ID,
    organisationId,
    organisationName,
    fullName: "Public Preview",
    email: "preview@headroom.technology",
    role: "Administrator",
    status: "Active",
  };
}

export function isPublicAccessViewer(viewer: Viewer) {
  return viewer.id === PUBLIC_ACCESS_VIEWER_ID;
}
