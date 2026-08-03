import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/admin-request";
import { writeAdminAuditLog } from "@/lib/admin-audit";
import { getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

type ApprovalStatus = "pending" | "approved" | "rejected";

type ChronicleRow = {
  id: number;
  event_at: string;
  nation: string;
  content: string;
  is_deleted: boolean;
  approval_status: ApprovalStatus;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  author_name: string;
  created_at: string;
};

function unauthorized() {
  return NextResponse.json({ message: "관리자 로그인이 필요합니다." }, { status: 401 });
}

function masterOnly() {
  return NextResponse.json({ message: "연대기 반영은 마스터 관리자만 가능합니다." }, { status: 403 });
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

function shouldRevalidate(before?: ChronicleRow | null, after?: ChronicleRow | null) {
  return before?.approval_status === "approved" || after?.approval_status === "approved";
}

function chronicleSelect() {
  return `
    id,
    to_char(event_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS event_at,
    nation,
    content,
    is_deleted,
    approval_status,
    reviewed_by_name,
    to_char(reviewed_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI:SS') AS reviewed_at,
    author_name,
    to_char(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI:SS') AS created_at
  `;
}

export async function GET(request: Request) {
  if (!getAdminSessionFromRequest(request)) {
    return unauthorized();
  }

  try {
    const sql = getSql();
    const entries = (await sql.query(`
      SELECT ${chronicleSelect()}
      FROM public.chronicle
      WHERE is_deleted = FALSE
      ORDER BY
        CASE approval_status
          WHEN 'pending' THEN 1
          WHEN 'approved' THEN 2
          ELSE 3
        END,
        event_at DESC,
        id DESC
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

    const approvalStatus: ApprovalStatus = session.role === "master" ? "approved" : "pending";
    const sql = getSql();
    const rows = (await sql`
      INSERT INTO public.chronicle (
        event_at,
        nation,
        content,
        is_deleted,
        author_name,
        approval_status,
        reviewed_by_name,
        reviewed_at
      )
      VALUES (
        ${eventAt},
        ${nation},
        ${content},
        FALSE,
        ${session.displayName},
        ${approvalStatus},
        ${session.role === "master" ? session.displayName : null},
        ${session.role === "master" ? new Date().toISOString() : null}
      )
      RETURNING
        id,
        to_char(event_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS event_at,
        nation,
        content,
        is_deleted,
        approval_status,
        reviewed_by_name,
        to_char(reviewed_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI:SS') AS reviewed_at,
        author_name,
        to_char(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI:SS') AS created_at
    `) as ChronicleRow[];

    await writeAdminAuditLog(sql, {
      entityType: "chronicle",
      entityId: rows[0].id,
      action: "create",
      actor: session,
      beforeData: null,
      afterData: rows[0]
    });

    if (approvalStatus === "approved") {
      revalidateTag("public-chronicle");
    }

    return NextResponse.json({ entry: rows[0] });
  } catch (error) {
    console.error("Failed to create chronicle entry", error);
    return NextResponse.json({ message: "연대기를 추가하지 못했습니다." }, { status: 500 });
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
      eventAt?: string;
      nation?: string;
      content?: string;
      action?: "approve" | "reject";
    };

    const id = Number(body.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ message: "처리할 연대기를 확인해주세요." }, { status: 400 });
    }

    const sql = getSql();
    const beforeRows = (await sql.query(`
      SELECT ${chronicleSelect()}
      FROM public.chronicle
      WHERE id = $1 AND is_deleted = FALSE
      LIMIT 1
    `, [id])) as ChronicleRow[];

    const before = beforeRows[0];

    if (!before) {
      return NextResponse.json({ message: "처리할 연대기를 찾을 수 없습니다." }, { status: 404 });
    }

    if (body.action === "approve" || body.action === "reject") {
      if (session.role !== "master") {
        return masterOnly();
      }

      const nextStatus: ApprovalStatus = body.action === "approve" ? "approved" : "rejected";
      const rows = (await sql`
        UPDATE public.chronicle
        SET
          approval_status = ${nextStatus},
          reviewed_by_name = ${session.displayName},
          reviewed_at = now()
        WHERE id = ${id} AND is_deleted = FALSE
        RETURNING
          id,
          to_char(event_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS event_at,
          nation,
          content,
          is_deleted,
          approval_status,
          reviewed_by_name,
          to_char(reviewed_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI:SS') AS reviewed_at,
          author_name,
          to_char(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI:SS') AS created_at
      `) as ChronicleRow[];

      await writeAdminAuditLog(sql, {
        entityType: "chronicle",
        entityId: id,
        action: body.action,
        actor: session,
        beforeData: before,
        afterData: rows[0]
      });

      revalidateTag("public-chronicle");

      return NextResponse.json({ entry: rows[0] });
    }

    const eventAt = typeof body.eventAt === "string" ? normalizeDateTime(body.eventAt) : "";
    const nation = typeof body.nation === "string" ? body.nation.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!eventAt || !nation || !content) {
      return NextResponse.json({ message: "수정할 연대기 정보를 확인해주세요." }, { status: 400 });
    }

    const rows = (await sql`
      UPDATE public.chronicle
      SET
        event_at = ${eventAt},
        nation = ${nation},
        content = ${content},
        approval_status = ${session.role === "master" ? before.approval_status : "pending"},
        reviewed_by_name = ${session.role === "master" ? before.reviewed_by_name : null},
        reviewed_at = ${session.role === "master" ? before.reviewed_at : null}
      WHERE id = ${id} AND is_deleted = FALSE
      RETURNING
        id,
        to_char(event_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS event_at,
        nation,
        content,
        is_deleted,
        approval_status,
        reviewed_by_name,
        to_char(reviewed_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI:SS') AS reviewed_at,
        author_name,
        to_char(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI:SS') AS created_at
    `) as ChronicleRow[];

    await writeAdminAuditLog(sql, {
      entityType: "chronicle",
      entityId: id,
      action: "update",
      actor: session,
      beforeData: before,
      afterData: rows[0]
    });

    if (shouldRevalidate(before, rows[0])) {
      revalidateTag("public-chronicle");
    }

    return NextResponse.json({ entry: rows[0] });
  } catch (error) {
    console.error("Failed to update chronicle entry", error);
    return NextResponse.json({ message: "연대기를 수정하지 못했습니다." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = getAdminSessionFromRequest(request);

  if (!session) {
    return unauthorized();
  }

  try {
    const body = (await request.json()) as { id?: number };
    const id = Number(body.id);

    if (!Number.isInteger(id)) {
      return NextResponse.json({ message: "삭제할 연대기를 확인해주세요." }, { status: 400 });
    }

    const sql = getSql();
    const beforeRows = (await sql.query(`
      SELECT ${chronicleSelect()}
      FROM public.chronicle
      WHERE id = $1 AND is_deleted = FALSE
      LIMIT 1
    `, [id])) as ChronicleRow[];

    const before = beforeRows[0];

    if (!before) {
      return NextResponse.json({ message: "삭제할 연대기를 찾을 수 없습니다." }, { status: 404 });
    }

    if (session.role !== "master" && before.approval_status === "approved") {
      return NextResponse.json({ message: "승인된 연대기는 마스터 관리자만 삭제할 수 있습니다." }, { status: 403 });
    }

    const rows = await sql`
      UPDATE public.chronicle
      SET is_deleted = TRUE
      WHERE id = ${id} AND is_deleted = FALSE
      RETURNING id, event_at, nation, content, is_deleted, approval_status, reviewed_by_name, reviewed_at, author_name, created_at
    `;

    await writeAdminAuditLog(sql, {
      entityType: "chronicle",
      entityId: id,
      action: "delete",
      actor: session,
      beforeData: before,
      afterData: rows[0]
    });

    if (before.approval_status === "approved") {
      revalidateTag("public-chronicle");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete chronicle entry", error);
    return NextResponse.json({ message: "연대기를 삭제하지 못했습니다." }, { status: 500 });
  }
}
