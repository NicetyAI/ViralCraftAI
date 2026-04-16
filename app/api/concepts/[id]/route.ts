import { auth } from "@/server/auth/config";
import { prisma } from "@/server/db";
import type { ConceptStatus } from "@prisma/client";
import { NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

const ALLOWED = new Set(["DRAFT", "ACTIVE", "ARCHIVED", "COMPLETED"]);

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: conceptId } = await params;

  let body: { status?: string };
  try {
    body = (await request.json()) as { status?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const status =
    typeof body.status === "string" ? body.status.trim() : "";
  if (!status || !ALLOWED.has(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const existing = await prisma.concept.findFirst({
    where: {
      id: conceptId,
      client: { workspace: { ownerUserId: session.user.id } },
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const concept = await prisma.concept.update({
    where: { id: conceptId },
    data: { status: status as ConceptStatus },
    select: {
      id: true,
      title: true,
      summary: true,
      status: true,
      metadata: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ concept });
}
