import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getSql } from "@/lib/db";
import { getAdminSessionFromRequest } from "@/lib/admin-request";

export const dynamic = "force-dynamic";

type ChronicleRow = {
  id: number;
  event_at: string;
  nation: string;
  content: string;
  is_deleted: boolean;
  author_name: string;
  created_at: string;
};

function unauthorized() {
  return NextResponse.json({ message: "관리자 로그인이 필요합니다." }, { status: 401 });
}

function normalizeDateTime(value: string) {
  const normalized = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return `${normalized} 00:00:00+09:00`;
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized)) {
    return `${normalized.replace("T", " ")}:00+09:00`;
  }

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(normalized)) {
    return `${normalized}:00+09:00`;
  }

  return normalized;
}

export async function GET(request: Request) {
  if (!getAdminSessionFromRequest(request)) {
    return unauthorized();
  }

  try {
    const sql = getSql();
    const entries = (await sql.query(`
      SELECT
        id,
        to_char(event_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS event_at,
        nation,
        content,
        is_deleted,
        author_name,
        to_char(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI:SS') AS created_at
      FROM public.chronicle
      WHERE is_deleted = FALSE
      ORDER BY event_at ASC, id ASC
    `)) as ChronicleRow[];

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Failed to load chronicle entries", error);
    return NextResponse.json({ message: "연대기 정보를 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return unauthorized();
  }

  try {
    const body = (await request.json()) as {
      eventAt?: string;
      nation?: string;
      content?: string;
    };

    const eventAt = typeof body.eventAt === "string" ? normalizeDateTime(body.eventAt) : "";
    const nation = typeof body.nation === "string" ? body.nation.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!eventAt || !nation || !content) {
      return NextResponse.json({ message: "발생일, 국가, 내용을 모두 입력해주세요." }, { status: 400 });
    }

    const sql = getSql();
    const rows = (await sql`
      INSERT INTO public.chronicle (event_at, nation, content, is_deleted, author_name)
      VALUES (${eventAt}, ${nation}, ${content}, FALSE, ${session.displayName})
      RETURNING
        id,
        to_char(event_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS event_at,
        nation,
        content,
        is_deleted,
        author_name,
        to_char(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI:SS') AS created_at
    `) as ChronicleRow[];

    revalidateTag("public-chronicle");

    return NextResponse.json({ entry: rows[0] });
  } catch (error) {
    console.error("Failed to create chronicle entry", error);
    return NextResponse.json({ message: "연대기를 추가하지 못했습니다." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!getAdminSessionFromRequest(request)) {
    return unauthorized();
  }

  try {
    const body = (await request.json()) as {
      id?: number;
      eventAt?: string;
      nation?: string;
      content?: string;
    };

    const id = Number(body.id);
    const eventAt = typeof body.eventAt === "string" ? normalizeDateTime(body.eventAt) : "";
    const nation = typeof body.nation === "string" ? body.nation.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!Number.isInteger(id) || !eventAt || !nation || !content) {
      return NextResponse.json({ message: "수정할 연대기 정보를 확인해주세요." }, { status: 400 });
    }

    const sql = getSql();
    const rows = (await sql`
      UPDATE public.chronicle
      SET
        event_at = ${eventAt},
        nation = ${nation},
        content = ${content}
      WHERE id = ${id} AND is_deleted = FALSE
      RETURNING
        id,
        to_char(event_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS event_at,
        nation,
        content,
        is_deleted,
        author_name,
        to_char(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI:SS') AS created_at
    `) as ChronicleRow[];

    if (!rows[0]) {
      return NextResponse.json({ message: "수정할 연대기를 찾을 수 없습니다." }, { status: 404 });
    }

    revalidateTag("public-chronicle");

    return NextResponse.json({ entry: rows[0] });
  } catch (error) {
    console.error("Failed to update chronicle entry", error);
    return NextResponse.json({ message: "연대기를 수정하지 못했습니다." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!getAdminSessionFromRequest(request)) {
    return unauthorized();
  }

  try {
    const body = (await request.json()) as { id?: number };
    const id = Number(body.id);

    if (!Number.isInteger(id)) {
      return NextResponse.json({ message: "삭제할 연대기를 확인해주세요." }, { status: 400 });
    }

    const sql = getSql();
    const rows = await sql`
      UPDATE public.chronicle
      SET is_deleted = TRUE
      WHERE id = ${id} AND is_deleted = FALSE
      RETURNING id
    `;

    if (!rows[0]) {
      return NextResponse.json({ message: "삭제할 연대기를 찾을 수 없습니다." }, { status: 404 });
    }

    revalidateTag("public-chronicle");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete chronicle entry", error);
    return NextResponse.json({ message: "연대기를 삭제하지 못했습니다." }, { status: 500 });
  }
}
