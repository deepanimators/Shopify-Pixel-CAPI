export type GlobalRole = "platform_admin" | "member";
export type TenantRole = "tenant_owner" | "tenant_admin" | "analyst" | "viewer";

export interface AuthUser {
  userId: string;
  email: string;
  displayName: string;
  globalRole: GlobalRole;
  status: "active" | "disabled";
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  sessionToken: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
}

export interface TenantMembership {
  userId: string;
  tenantId: string;
  role: TenantRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContext {
  user: Omit<AuthUser, "passwordHash">;
  memberships: TenantMembership[];
  accessibleTenantIds: string[];
  canManageAllTenants: boolean;
}
