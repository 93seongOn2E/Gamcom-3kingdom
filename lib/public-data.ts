import { unstable_cache } from "next/cache";
import { getSql } from "@/lib/db";
import type { TerritoryFacility, TerritoryOwnerShort } from "@/lib/territory-map-config";

export type ForceIdShort = "위" | "촉" | "오";
export type ForceIdFull = "위나라" | "촉나라" | "오나라";

export type CastlePayload = {
  castleKey: string;
  name: string;
  level: 1 | 2 | 3;
  owner: TerritoryOwnerShort;
  isCapital: boolean;
  isCheonrimun: boolean;
  facilityType: TerritoryFacility;
  x?: number;
  y?: number;
};

export type CastleDataPayload = {
  forces: Record<ForceIdShort, CastlePayload[]>;
};

export type ChroniclePayload = {
  nations: string[];
  date: string;
  content: string;
};

type CastleRow = {
  castle_key: string;
  name: string;
  kingdom: ForceIdShort;
  level: number;
  map_x: string | null;
  map_y: string | null;
  is_occupied: boolean;
  is_capital: boolean;
  is_cheonrimun: boolean;
  facility_type: TerritoryFacility;
};

type ChronicleRow = {
  nation: string;
  content: string;
  event_at: string;
};

const emptyForces: Record<ForceIdShort, CastlePayload[]> = { 위: [], 촉: [], 오: [] };

function getOriginForce(castleKey: string): ForceIdShort | null {
  if (castleKey.startsWith("위-")) return "위";
  if (castleKey.startsWith("촉-")) return "촉";
  if (castleKey.startsWith("오-")) return "오";
  return null;
}

export async function getCastleData(): Promise<CastleDataPayload> {
  const sql = getSql();
  const rows = await sql`
    SELECT castle_key, name, kingdom, level, map_x, map_y, is_occupied, is_capital, is_cheonrimun, facility_type
    FROM public.castle
    WHERE name ~ '^[0-9]+$'
    ORDER BY NULLIF(regexp_replace(name, '[^0-9]', '', 'g'), '')::integer NULLS LAST, id
  ` as CastleRow[];

  const forces: Record<ForceIdShort, CastlePayload[]> = {
    위: [],
    촉: [],
    오: []
  };

  rows.forEach((row) => {
    const origin = getOriginForce(row.castle_key);
    if (!origin) return;

    forces[origin].push({
      castleKey: row.castle_key,
      name: row.name,
      level: row.level as 1 | 2 | 3,
      owner: row.is_occupied ? row.kingdom : "미점령",
      isCapital: row.is_occupied && row.is_capital,
      isCheonrimun: row.is_occupied && row.is_cheonrimun,
      facilityType: row.is_occupied ? row.facility_type : "없음",
      ...(row.map_x === null ? {} : { x: Number(row.map_x) }),
      ...(row.map_y === null ? {} : { y: Number(row.map_y) })
    });
  });

  return { forces };
}

export async function getChronicleData(): Promise<ChroniclePayload[]> {
  const sql = getSql();
  const rows = await sql.query(`
    SELECT
      nation,
      content,
      to_char(event_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS event_at
    FROM public.chronicle
    WHERE is_deleted = FALSE
      AND approval_status = 'approved'
    ORDER BY event_at DESC, id DESC
    LIMIT 20
  `) as ChronicleRow[];

  return rows.map((row) => ({
    nations: row.nation.split(",").map((value) => value.trim()).filter(Boolean),
    date: row.event_at,
    content: row.content
  }));
}

export const getCachedCastleData = unstable_cache(
  getCastleData,
  ["public-castle-data"],
  { revalidate: 15, tags: ["public-castles"] }
);

export const getCachedChronicleData = unstable_cache(
  getChronicleData,
  ["public-chronicle-data"],
  { revalidate: 15, tags: ["public-chronicle"] }
);

export { emptyForces };
