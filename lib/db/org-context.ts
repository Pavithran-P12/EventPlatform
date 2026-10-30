import "server-only";

import { cookies } from "next/headers";

import type { OrganizationMembership } from "@/lib/db/types";
import { getMyOrganizations } from "@/lib/db/queries";

const ACTIVE_ORG_COOKIE = "ep_active_org";

export async function resolveActiveOrganization(
  memberships: OrganizationMembership[],
): Promise<OrganizationMembership | null> {
  if (memberships.length === 0) return null;
  const cookieStore = await cookies();
  const activeId = cookieStore.get(ACTIVE_ORG_COOKIE)?.value;
  return (
    memberships.find((m) => m.organization.id === activeId) ?? memberships[0]
  );
}

export async function getActiveOrganization(
  userId: string,
): Promise<OrganizationMembership | null> {
  const memberships = await getMyOrganizations(userId);
  return resolveActiveOrganization(memberships);
}

export async function setActiveOrganizationCookie(
  organizationId: string,
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ORG_COOKIE, organizationId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
