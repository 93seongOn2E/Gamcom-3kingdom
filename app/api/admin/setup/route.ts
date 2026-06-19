import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    { message: "관리자 최초 생성 기능은 비활성화되었습니다." },
    { status: 403 }
  );
}
