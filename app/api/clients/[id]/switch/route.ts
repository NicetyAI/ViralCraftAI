import { auth } from "@/server/auth/config";
import {
  ACTIVE_CLIENT_COOKIE_NAME,
  activeClientCookieOptions,
  confirmActiveClientForUser,
} from "@/server/clients/service";
import { prisma } from "@/server/db";
import { NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: clientId } = await params;
  const ok = await confirmActiveClientForUser(
    prisma,
    session.user.id,
    clientId,
  );
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const res = NextResponse.json({
    activeClientId: ok.activeClientId,
  });
  res.cookies.set(
    ACTIVE_CLIENT_COOKIE_NAME,
    ok.activeClientId,
    activeClientCookieOptions(),
  );
  return res;
}
