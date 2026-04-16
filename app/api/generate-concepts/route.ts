import { auth } from "@/server/auth/config";
import {
  ACTIVE_CLIENT_COOKIE_NAME,
  confirmActiveClientForUser,
} from "@/server/clients/service";
import { buildConceptDrafts } from "@/server/concepts/generate-stub";
import { prisma } from "@/server/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const AUDIENCES = new Set([
  "Homeowners",
  "Small business owners",
  "Seniors/families",
  "Young professionals",
  "First-time homebuyers",
  "Property managers",
  "Couples/families",
  "Entrepreneurs",
]);

const PLATFORMS = new Set([
  "TikTok / Reels",
  "YouTube Shorts",
  "Facebook",
  "LinkedIn",
]);

const COMEDY_STYLES = new Set([
  "Relatable cringe",
  "Sarcastic",
  "Absurdist / exaggerated",
  "Before vs after",
  "Day-in-life parody",
  "Dramatic reenactment",
]);

type Body = {
  industry?: string;
  industryIsCustom?: boolean;
  industryCustom?: string;
  targetAudience?: string;
  platform?: string;
  comedyStyle?: string;
  painPoints?: string;
  conceptCount?: number;
  clientId?: string;
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const activeClientId = cookieStore.get(ACTIVE_CLIENT_COOKIE_NAME)?.value;
  const clientId =
    typeof body.clientId === "string" ? body.clientId.trim() : "";
  if (!clientId || clientId !== activeClientId) {
    return NextResponse.json(
      {
        error:
          "Active client mismatch. Select a client in the header switcher and try again.",
      },
      { status: 400 },
    );
  }

  const allowed = await confirmActiveClientForUser(
    prisma,
    session.user.id,
    clientId,
  );
  if (!allowed) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const industryIsCustom = Boolean(body.industryIsCustom);
  const industryCustom =
    typeof body.industryCustom === "string"
      ? body.industryCustom.trim()
      : "";
  const industryPreset =
    typeof body.industry === "string" ? body.industry.trim() : "";

  const industry = industryIsCustom
    ? industryCustom
    : industryPreset;
  if (!industry) {
    return NextResponse.json(
      { error: "Industry / service is required" },
      { status: 400 },
    );
  }

  const targetAudience =
    typeof body.targetAudience === "string"
      ? body.targetAudience.trim()
      : "";
  if (!targetAudience || !AUDIENCES.has(targetAudience)) {
    return NextResponse.json(
      { error: "Invalid target audience" },
      { status: 400 },
    );
  }

  const platform =
    typeof body.platform === "string" ? body.platform.trim() : "";
  if (!platform || !PLATFORMS.has(platform)) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  const comedyStyle =
    typeof body.comedyStyle === "string" ? body.comedyStyle.trim() : "";
  if (!comedyStyle || !COMEDY_STYLES.has(comedyStyle)) {
    return NextResponse.json({ error: "Invalid comedy style" }, { status: 400 });
  }

  const rawCount = Number(body.conceptCount);
  const conceptCount = [2, 4, 6].includes(rawCount) ? rawCount : 4;

  const painPoints =
    typeof body.painPoints === "string" ? body.painPoints.trim() : undefined;

  const drafts = buildConceptDrafts({
    industry,
    targetAudience,
    platform,
    comedyStyle,
    painPoints,
    count: conceptCount,
  });

  const concepts = await prisma.$transaction(
    drafts.map((d) =>
      prisma.concept.create({
        data: {
          clientId,
          title: d.title,
          summary: d.summary,
          metadata: d.card,
          status: "DRAFT",
        },
        select: {
          id: true,
          title: true,
          summary: true,
          status: true,
          createdAt: true,
          metadata: true,
        },
      }),
    ),
  );

  return NextResponse.json({
    concepts,
    meta: {
      industry,
      targetAudience,
      platform,
      comedyStyle,
      conceptCount,
    },
  });
}
