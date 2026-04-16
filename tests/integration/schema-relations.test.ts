import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());

describe.skipIf(!hasDatabaseUrl)("Prisma schema", () => {
  const prisma = new PrismaClient();

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("exposes core models for agency workflow", () => {
    expect(prisma.user).toBeDefined();
    expect(prisma.agencyWorkspace).toBeDefined();
    expect(prisma.client).toBeDefined();
    expect(prisma.concept).toBeDefined();
    expect(prisma.videoJob).toBeDefined();
    expect(prisma.videoAsset).toBeDefined();
    expect(prisma.captionPack).toBeDefined();
    expect(prisma.postingSchedule).toBeDefined();
    expect(prisma.scheduledPost).toBeDefined();
    expect(prisma.supportContent).toBeDefined();
  });

  it("persists nested relations end-to-end", async () => {
    const suffix = `${Date.now()}`;
    let userId: string | undefined;

    try {
      const user = await prisma.user.create({
        data: {
          email: `integration-${suffix}@test.local`,
          name: "Integration User",
        },
      });
      userId = user.id;

      const workspace = await prisma.agencyWorkspace.create({
        data: {
          name: "Integration Workspace",
          ownerUserId: user.id,
        },
      });

      const client = await prisma.client.create({
        data: {
          workspaceId: workspace.id,
          name: "Brand",
          industry: "Tech",
          audience: "Builders",
          painPoints: "Time",
        },
      });

      const concept = await prisma.concept.create({
        data: {
          clientId: client.id,
          title: "Spring push",
          status: "DRAFT",
          summary: "Test",
        },
      });

      await prisma.videoJob.create({
        data: {
          conceptId: concept.id,
          status: "QUEUED",
          retries: 0,
        },
      });

      await prisma.videoAsset.create({
        data: {
          conceptId: concept.id,
          url: "https://example.com/video.mp4",
          mimeType: "video/mp4",
          durationSeconds: 42,
        },
      });

      await prisma.captionPack.create({
        data: {
          conceptId: concept.id,
          captions: ["Line one", "Line two"],
          hashtags: ["#viral", "#test"],
        },
      });

      const schedule = await prisma.postingSchedule.create({
        data: {
          conceptId: concept.id,
          timezone: "America/New_York",
          startDate: new Date("2026-04-01"),
        },
      });

      const scheduledPost = await prisma.scheduledPost.create({
        data: {
          scheduleId: schedule.id,
          dayIndex: 0,
          publishAt: new Date("2026-04-01T12:00:00.000Z"),
          platform: "tiktok",
          contentAngle: "Problem → proof",
        },
      });

      await prisma.supportContent.create({
        data: {
          scheduledPostId: scheduledPost.id,
          kind: "hook",
          body: "Stop scrolling — this one change doubled our leads.",
        },
      });

      const loaded = await prisma.concept.findUniqueOrThrow({
        where: { id: concept.id },
        include: {
          videoJobs: true,
          videoAsset: true,
          captionPacks: true,
          postingSchedules: {
            include: {
              posts: {
                include: { supportContents: true },
              },
            },
          },
        },
      });

      expect(loaded.videoJobs).toHaveLength(1);
      expect(loaded.videoAsset?.url).toContain("video.mp4");
      expect(loaded.captionPacks).toHaveLength(1);
      expect(loaded.postingSchedules[0]?.posts[0]?.supportContents).toHaveLength(1);
    } finally {
      if (userId) {
        await prisma.user.delete({ where: { id: userId } });
      }
    }
  });
});

describe("Prisma schema (client shape)", () => {
  it("has core models when Prisma Client is generated", async () => {
    const prisma = new PrismaClient();
    try {
      expect(prisma.user).toBeDefined();
      expect(prisma.agencyWorkspace).toBeDefined();
      expect(prisma.client).toBeDefined();
      expect(prisma.concept).toBeDefined();
      expect(prisma.videoJob).toBeDefined();
      expect(prisma.videoAsset).toBeDefined();
      expect(prisma.captionPack).toBeDefined();
      expect(prisma.postingSchedule).toBeDefined();
      expect(prisma.scheduledPost).toBeDefined();
      expect(prisma.supportContent).toBeDefined();
    } finally {
      await prisma.$disconnect();
    }
  });
});
