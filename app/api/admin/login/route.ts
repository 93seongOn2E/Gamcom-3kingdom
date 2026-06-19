import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, createSessionToken, getAdminCookieOptions, verifyPassword } from "@/lib/admin-auth";
import { getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

type AdminRow = {
  id: number;
  username: string;
  display_name: string | null;
  password_hash: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json() as { username?: string; password?: string };
    const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!username || !password) {
      return NextResponse.json({ message: "아이디와 비밀번호를 입력해주세요." }, { status: 400 });
    }

    const sql = getSql();
    const rows = await sql`
      SELECT id, username, display_name, password_hash
      FROM public.admin
      WHERE username = ${username} AND is_active = true
      LIMIT 1
    ` as AdminRow[];

    const admin = rows[0];

    if (!admin || !verifyPassword(password, admin.password_hash)) {
      return NextResponse.json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    await sql`
      UPDATE public.admin
      SET last_login_at = now(), updated_at = now()
      WHERE id = ${admin.id}
    `;

    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      ADMIN_SESSION_COOKIE,
      createSessionToken({
        adminId: admin.id,
        username: admin.username,
        displayName: admin.display_name || admin.username
      }),
      getAdminCookieOptions()
    );

    return response;
  } catch (error) {
    console.error("Admin login failed", error);
    return NextResponse.json({ message: "로그인에 실패했습니다." }, { status: 500 });
  }
}
