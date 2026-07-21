import { NextResponse } from "next/server";
import { ADMIN_HINT_COOKIE, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function clearAdminCookies(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
  response.cookies.set(ADMIN_HINT_COOKIE, "", {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url), { status: 303 });
  clearAdminCookies(response);
  return response;
}

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url), { status: 303 });
  clearAdminCookies(response);
  return response;
}
