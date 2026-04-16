import { auth } from "@/server/auth/config";
import {
  ACTIVE_CLIENT_COOKIE_NAME,
  getOrCreateWorkspace,
} from "@/server/clients/service";
import { prisma } from "@/server/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await getOrCreateWorkspace(
    prisma,
    session.user.id,
    session.user.name ? `${session.user.name}'s workspace` : "My agency",
  );

  const clients = await prisma.client.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      industry: true,
      audience: true,
      painPoints: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const cookieStore = await cookies();
  const activeClientId =
    cookieStore.get(ACTIVE_CLIENT_COOKIE_NAME)?.value ?? null;

  return NextResponse.json({ clients, activeClientId });
}

type CreateBody = {
  name?: string;
  industry?: string;
  audience?: string;
  painPoints?: string;
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateBody;
  try {
    body = (await request.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const industry =
    typeof body.industry === "string" ? body.industry.trim() : "";
  if (!name || !industry) {
    return NextResponse.json(
      { error: "name and industry are required" },
      { status: 400 },
    );
  }

  const audience =
    typeof body.audience === "string" ? body.audience.trim() : undefined;
  const painPoints =
    typeof body.painPoints === "string" ? body.painPoints.trim() : undefined;

  const workspace = await getOrCreateWorkspace(
    prisma,
    session.user.id,
    session.user.name ? `${session.user.name}'s workspace` : "My agency",
  );

  const client = await prisma.client.create({
    data: {
      workspaceId: workspace.id,
      name,
      industry,
      audience: audience || null,
      painPoints: painPoints || null,
    },
  });

  return NextResponse.json({ client }, { status: 201 });
}
