import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = request.headers.get("cookie")
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${ADMIN_SESSION_COOKIE}=`))
    ?.split("=")[1];

  const session = verifySessionToken(token);

  return NextResponse.json({
    authenticated: Boolean(session),
    user: session ? { username: session.username, displayName: session.displayName } : null
  });
}
