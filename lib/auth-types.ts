export const USER_ROLES = [
  "Administrator",
  "Technical Supervisor",
  "Installer",
  "Auditor",
  "Office",
] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type UserStatus = "Active" | "Invited" | "Suspended";

export type Viewer = {
  id: string;
  organisationId: string;
  organisationName: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.includes(value as UserRole);
}

