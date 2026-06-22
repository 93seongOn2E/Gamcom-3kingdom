import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";
import { getCachedCastleData, getCastleData } from "@/lib/public-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const data = searchParams.get("fresh") === "1"
      ? await getCastleData()
      : await getCachedCastleData();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to load castles from Neon", error);
    return NextResponse.json({ message: "성 데이터를 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const token = request.headers
    .get("cookie")
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${ADMIN_SESSION_COOKIE}=`))
    ?.split("=")[1];

  if (!verifySessionToken(token)) {
    return NextResponse.json({ message: "관리자 로그인이 필요합니다." }, { status: 401 });
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return NextResponse.json({ message: "DATABASE_URL이 설정되지 않았습니다." }, { status: 500 });
  }

  try {
    const body = await request.json() as {
      castleKey?: unknown;
      name?: unknown;
      level?: unknown;
      x?: unknown;
      y?: unknown;
      kingdom?: unknown;
    };

    const castleKey = typeof body.castleKey === "string" ? body.castleKey : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const level = Number(body.level);
    const x = Number(body.x);
    const y = Number(body.y);
    const kingdom = body.kingdom;

    if (!/^(위|촉|오)-\d{3}$/.test(castleKey)) {
      return NextResponse.json({ message: "올바르지 않은 성 ID입니다." }, { status: 400 });
    }

    if (!name || name.length > 30) {
      return NextResponse.json({ message: "성 이름을 확인해주세요." }, { status: 400 });
    }

    if (!Number.isInteger(level) || level < 1 || level > 3) {
      return NextResponse.json({ message: "성 등급을 확인해주세요." }, { status: 400 });
    }

    if (!Number.isFinite(x) || x < 0 || x > 1180 || !Number.isFinite(y) || y < 0 || y > 720) {
      return NextResponse.json({ message: "좌표가 지도 범위를 벗어났습니다." }, { status: 400 });
    }

    if (kingdom !== "위" && kingdom !== "촉" && kingdom !== "오") {
      return NextResponse.json({ message: "세력을 확인해주세요." }, { status: 400 });
    }

    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(databaseUrl);
    const rows = await sql`
      UPDATE public.castle
      SET name = ${name},
          level = ${level},
          map_x = ${x},
          map_y = ${y},
          area_scale = 1,
          kingdom = ${kingdom},
          updated_at = now()
      WHERE castle_key = ${castleKey}
      RETURNING castle_key, name, level, map_x, map_y, kingdom
    `;

    if (rows.length === 0) {
      return NextResponse.json({ message: "해당 성을 찾을 수 없습니다." }, { status: 404 });
    }

    revalidateTag("public-castles");

    return NextResponse.json({
      castleKey: rows[0].castle_key,
      name: rows[0].name,
      level: Number(rows[0].level),
      x: Number(rows[0].map_x),
      y: Number(rows[0].map_y),
      areaScale: 1,
      kingdom: rows[0].kingdom
    });
  } catch (error) {
    console.error("Failed to update castle in Neon", error);
    return NextResponse.json({ message: "성 정보를 저장하지 못했습니다." }, { status: 500 });
  }
}
