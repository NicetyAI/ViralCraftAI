import { auth } from "@/server/auth/config";
import { getOrCreateWorkspace } from "@/server/clients/service";
import { prisma } from "@/server/db";
import { NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

type PatchBody = {
  name?: string;
  industry?: string;
  audience?: string | null;
  painPoints?: string | null;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: clientId } = await params;

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const workspace = await getOrCreateWorkspace(
    prisma,
    session.user.id,
    session.user.name ? `${session.user.name}'s workspace` : "My agency",
  );

  const existing = await prisma.client.findFirst({
    where: { id: clientId, workspaceId: workspace.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data: {
    name?: string;
    industry?: string;
    audience?: string | null;
    painPoints?: string | null;
  } = {};

  if (typeof body.name === "string") {
    const n = body.name.trim();
    if (!n) {
      return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
    }
    data.name = n;
  }
  if (typeof body.industry === "string") {
    const ind = body.industry.trim();
    if (!ind) {
      return NextResponse.json(
        { error: "industry cannot be empty" },
        { status: 400 },
      );
    }
    data.industry = ind;
  }
  if (body.audience !== undefined) {
    data.audience =
      typeof body.audience === "string" ? body.audience.trim() || null : null;
  }
  if (body.painPoints !== undefined) {
    data.painPoints =
      typeof body.painPoints === "string"
        ? body.painPoints.trim() || null
        : null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const client = await prisma.client.update({
    where: { id: clientId },
    data,
  });

  return NextResponse.json({ client });
}
