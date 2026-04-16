import type { PrismaClient } from "@prisma/client";

export const ACTIVE_CLIENT_COOKIE_NAME = "vc_active_client";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type ActiveClientSwitchResult = {
  sessionId: string;
  activeClientId: string;
};

/**
 * @deprecated Prefer confirmActiveClientForUser for real requests.
 * Kept for tests / plan compatibility: records intent to switch workspace context.
 */
export async function setActiveClientId(
  sessionId: string,
  clientId: string,
): Promise<ActiveClientSwitchResult> {
  return { sessionId, activeClientId: clientId };
}

export async function getOrCreateWorkspace(
  prisma: PrismaClient,
  ownerUserId: string,
  defaultName = "My agency",
) {
  const existing = await prisma.agencyWorkspace.findUnique({
    where: { ownerUserId },
  });
  if (existing) {
    return existing;
  }
  return prisma.agencyWorkspace.create({
    data: {
      name: defaultName,
      ownerUserId,
    },
  });
}

export async function confirmActiveClientForUser(
  prisma: PrismaClient,
  ownerUserId: string,
  clientId: string,
): Promise<{ activeClientId: string } | null> {
  const workspace = await prisma.agencyWorkspace.findUnique({
    where: { ownerUserId },
  });
  if (!workspace) {
    return null;
  }
  const client = await prisma.client.findFirst({
    where: { id: clientId, workspaceId: workspace.id },
  });
  if (!client) {
    return null;
  }
  return { activeClientId: client.id };
}

export function activeClientCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  };
}
