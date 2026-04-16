import { afterAll, describe, expect, it } from "vitest";
import {
  ACTIVE_CLIENT_COOKIE_NAME,
  confirmActiveClientForUser,
  setActiveClientId,
} from "@/server/clients/service";
import { PrismaClient } from "@prisma/client";

describe("Client switching", () => {
  it("stores active client id for owner session (plan compat)", async () => {
    const result = await setActiveClientId("session-1", "client-123");
    expect(result.activeClientId).toBe("client-123");
  });

  it("uses a stable httpOnly cookie name for active client", () => {
    expect(ACTIVE_CLIENT_COOKIE_NAME).toBe("vc_active_client");
  });
});

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());

describe.skipIf(!hasDatabaseUrl)("confirmActiveClientForUser (db)", () => {
  const prisma = new PrismaClient();

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("returns activeClientId when client belongs to owner workspace", async () => {
    const suffix = `${Date.now()}`;
    let userId: string | undefined;
    try {
      const user = await prisma.user.create({
        data: {
          email: `client-switch-${suffix}@test.local`,
          name: "Owner",
        },
      });
      userId = user.id;
      const workspace = await prisma.agencyWorkspace.create({
        data: {
          name: "WS",
          ownerUserId: user.id,
        },
      });
      const client = await prisma.client.create({
        data: {
          workspaceId: workspace.id,
          name: "Brand",
          industry: "Tech",
        },
      });

      const ok = await confirmActiveClientForUser(prisma, user.id, client.id);
      expect(ok).toEqual({ activeClientId: client.id });

      const bad = await confirmActiveClientForUser(prisma, user.id, "fake-id");
      expect(bad).toBeNull();
    } finally {
      if (userId) {
        await prisma.user.delete({ where: { id: userId } });
      }
    }
  });
});
