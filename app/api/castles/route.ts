import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getAdminSessionFromRequest } from "@/lib/admin-request";
import { writeAdminAuditLog } from "@/lib/admin-audit";
import { getSql } from "@/lib/db";
import { getCachedCastleData, getCastleData } from "@/lib/public-data";
import { territoryFacilityOptions, type TerritoryFacility } from "@/lib/territory-map-config";

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
  const session = getAdminSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "관리자 로그인이 필요합니다." }, { status: 401 });
  }

  if (session.role !== "master") {
    return NextResponse.json({ message: "영토 수정은 마스터 권한만 가능합니다." }, { status: 403 });
  }

  try {
    const body = await request.json() as {
      castleKey?: unknown;
      name?: unknown;
      level?: unknown;
      x?: unknown;
      y?: unknown;
      kingdom?: unknown;
      facilityType?: unknown;
      isCapital?: unknown;
    };

    const castleKey = typeof body.castleKey === "string" ? body.castleKey : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const level = Number(body.level);
    const x = Number(body.x);
    const y = Number(body.y);
    const kingdom = body.kingdom;
    const requestedFacility = typeof body.facilityType === "string" ? body.facilityType : "없음";
    const requestedIsCapital = body.isCapital === true;

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

    if (kingdom !== "위" && kingdom !== "촉" && kingdom !== "오" && kingdom !== "미점령") {
      return NextResponse.json({ message: "세력을 확인해주세요." }, { status: 400 });
    }

    if (!territoryFacilityOptions.includes(requestedFacility as TerritoryFacility)) {
      return NextResponse.json({ message: "시설 종류를 확인해주세요." }, { status: 400 });
    }

    const sql = getSql();
    const beforeRows = await sql`
      SELECT castle_key, name, level, map_x, map_y, area_scale, kingdom, is_occupied, is_capital, facility_type, updated_at
      FROM public.castle
      WHERE castle_key = ${castleKey}
      LIMIT 1
    `;

    const before = beforeRows[0];

    if (!before) {
      return NextResponse.json({ message: "해당 성을 찾을 수 없습니다." }, { status: 404 });
    }

    const isOccupied = kingdom !== "미점령";
    const persistedKingdom = isOccupied ? kingdom : before.kingdom;
    const facilityType = (isOccupied ? requestedFacility : "없음") as TerritoryFacility;
    const isCapital = isOccupied && requestedIsCapital;
    let replacedCapitalRows: Record<string, unknown>[] = [];
    let replacedCapitalAfterRows: Record<string, unknown>[] = [];
    let rows: Record<string, unknown>[];

    if (isCapital) {
      replacedCapitalRows = await sql`
        SELECT castle_key, name, level, map_x, map_y, area_scale, kingdom, is_occupied, is_capital, facility_type, updated_at
        FROM public.castle
        WHERE kingdom = ${persistedKingdom}
          AND is_use = true
          AND is_occupied = true
          AND is_capital = true
          AND castle_key <> ${castleKey}
      ` as Record<string, unknown>[];

      const transactionRows = await sql.transaction([
        sql`
          UPDATE public.castle
          SET is_capital = false,
              updated_at = now()
          WHERE kingdom = ${persistedKingdom}
            AND is_use = true
            AND is_occupied = true
            AND is_capital = true
            AND castle_key <> ${castleKey}
          RETURNING castle_key, name, level, map_x, map_y, area_scale, kingdom, is_occupied, is_capital, facility_type, updated_at
        `,
        sql`
          UPDATE public.castle
          SET name = ${name},
              level = ${level},
              map_x = ${x},
              map_y = ${y},
              area_scale = 1,
              kingdom = ${persistedKingdom},
              is_occupied = ${isOccupied},
              is_capital = ${isCapital},
              facility_type = ${facilityType},
              updated_at = now()
          WHERE castle_key = ${castleKey}
          RETURNING castle_key, name, level, map_x, map_y, kingdom, is_occupied, is_capital, facility_type
        `
      ]);

      replacedCapitalAfterRows = transactionRows[0] as Record<string, unknown>[];
      rows = transactionRows[1] as Record<string, unknown>[];
    } else {
      rows = await sql`
        UPDATE public.castle
        SET name = ${name},
            level = ${level},
            map_x = ${x},
            map_y = ${y},
            area_scale = 1,
            kingdom = ${persistedKingdom},
            is_occupied = ${isOccupied},
            is_capital = ${isCapital},
            facility_type = ${facilityType},
            updated_at = now()
        WHERE castle_key = ${castleKey}
        RETURNING castle_key, name, level, map_x, map_y, kingdom, is_occupied, is_capital, facility_type
      ` as Record<string, unknown>[];
    }

    if (rows.length === 0) {
      return NextResponse.json({ message: "해당 성을 찾을 수 없습니다." }, { status: 404 });
    }

    await writeAdminAuditLog(sql, {
      entityType: "castle",
      entityId: castleKey,
      action: "update",
      actor: session,
      beforeData: before,
      afterData: rows[0]
    });

    for (const replacedCapital of replacedCapitalRows) {
      const afterData = replacedCapitalAfterRows.find((row) => row.castle_key === replacedCapital.castle_key);
      if (!afterData) continue;

      await writeAdminAuditLog(sql, {
        entityType: "castle",
        entityId: String(replacedCapital.castle_key),
        action: "update",
        actor: session,
        beforeData: replacedCapital,
        afterData
      });
    }

    revalidateTag("public-castles");

    return NextResponse.json({
      castleKey: rows[0].castle_key,
      name: rows[0].name,
      level: Number(rows[0].level),
      x: Number(rows[0].map_x),
      y: Number(rows[0].map_y),
      areaScale: 1,
      kingdom: rows[0].is_occupied ? rows[0].kingdom : "미점령",
      isCapital: Boolean(rows[0].is_occupied && rows[0].is_capital),
      facilityType: rows[0].is_occupied ? rows[0].facility_type : "없음"
    });
  } catch (error) {
    console.error("Failed to update castle in Neon", error);
    return NextResponse.json({ message: "성 정보를 저장하지 못했습니다." }, { status: 500 });
  }
}
