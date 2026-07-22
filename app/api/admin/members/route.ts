import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSql } from "@/lib/db";
import { getAdminSessionFromRequest } from "@/lib/admin-request";
import { writeAdminAuditLog } from "@/lib/admin-audit";
import { hiddenJobNames } from "@/lib/factions-config";

export const dynamic = "force-dynamic";

type MemberRow = {
  id: number;
  nation: string;
  crew_name: string;
  nickname: string;
  job: string | null;
  weapon: number | null;
  helmet: number | null;
  armor: number | null;
  shoes: number | null;
};

function unauthorized() {
  return NextResponse.json({ message: "관리자 로그인이 필요합니다." }, { status: 401 });
}

export async function GET(request: Request) {
  if (!getAdminSessionFromRequest(request)) {
    return unauthorized();
  }

  try {
    const sql = getSql();
    const hiddenJobSqlList = hiddenJobNames.map((job) => `'${job.replaceAll("'", "''")}'`).join(", ");
    const members = (await sql.query(`
      SELECT id, nation, crew_name, nickname, job, weapon, helmet, armor, shoes
      FROM public.member
      ORDER BY
        CASE nation
          WHEN '위나라' THEN 1
          WHEN '촉나라' THEN 2
          WHEN '오나라' THEN 3
          ELSE 9
        END,
        CASE
          WHEN role_name = '군주' THEN 1
          WHEN job IN (${hiddenJobSqlList}) THEN 2
          ELSE 3
        END,
        weapon DESC NULLS LAST,
        CASE crew_name
          WHEN '버컴퍼니' THEN 1
          WHEN '버인협회' THEN 2
          WHEN '지력사무소' THEN 3
          WHEN '꾸한성' THEN 4
          WHEN '버블란' THEN 5
          WHEN '홍피스' THEN 6
          WHEN '로스타시티' THEN 7
          WHEN '원더독' THEN 8
          ELSE 99
        END,
        nickname
    `)) as MemberRow[];

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Failed to load members", error);
    return NextResponse.json({ message: "세력 정보를 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = getAdminSessionFromRequest(request);

  if (!session) {
    return unauthorized();
  }

  try {
    const body = (await request.json()) as {
      id?: number;
      job?: string | null;
      weapon?: number | null;
      helmet?: number | null;
      armor?: number | null;
      shoes?: number | null;
    };

    const id = Number(body.id);
    const job = typeof body.job === "string" ? body.job.trim() : body.job ?? null;
    const weapon = body.weapon == null ? null : Number(body.weapon);
    const helmet = body.helmet == null ? null : Number(body.helmet);
    const armor = body.armor == null ? null : Number(body.armor);
    const shoes = body.shoes == null ? null : Number(body.shoes);

    if (!Number.isInteger(id)) {
      return NextResponse.json({ message: "저장할 멤버를 확인해주세요." }, { status: 400 });
    }

    for (const value of [weapon, helmet, armor, shoes]) {
      if (value !== null && (!Number.isInteger(value) || value < 0)) {
        return NextResponse.json({ message: "장비 수치는 0 이상의 정수만 입력할 수 있습니다." }, { status: 400 });
      }
    }

    const sql = getSql();
    const beforeRows = (await sql`
      SELECT id, nation, crew_name, nickname, job, weapon, helmet, armor, shoes, updated_at
      FROM public.member
      WHERE id = ${id}
      LIMIT 1
    `) as Array<MemberRow & { updated_at: string }>;

    const before = beforeRows[0];

    if (!before) {
      return NextResponse.json({ message: "저장할 멤버를 찾을 수 없습니다." }, { status: 404 });
    }

    const rows = (await sql`
      UPDATE public.member
      SET
        job = ${job || null},
        weapon = ${weapon},
        helmet = ${helmet},
        armor = ${armor},
        shoes = ${shoes},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, nation, crew_name, nickname, job, weapon, helmet, armor, shoes
    `) as MemberRow[];

    if (!rows[0]) {
      return NextResponse.json({ message: "저장할 멤버를 찾을 수 없습니다." }, { status: 404 });
    }

    await writeAdminAuditLog(sql, {
      entityType: "member",
      entityId: id,
      action: "update",
      actor: session,
      beforeData: before,
      afterData: rows[0]
    });

    revalidatePath("/factions");

    return NextResponse.json({ member: rows[0] });
  } catch (error) {
    console.error("Failed to update member", error);
    return NextResponse.json({ message: "세력 정보를 저장하지 못했습니다." }, { status: 500 });
  }
}
