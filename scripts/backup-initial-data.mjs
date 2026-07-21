import fs from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

function loadEnv(filePath) {
  const env = {};
  const text = fs.readFileSync(filePath, "utf8");

  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (!match) continue;

    let value = match[2].trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    env[match[1].trim()] = value;
  }

  return env;
}

function sqlLiteral(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function insertRows(tableName, columns, rows) {
  if (rows.length === 0) {
    return [`-- public.${tableName} has no rows.`];
  }

  return [
    `INSERT INTO public.${tableName} (${columns.join(", ")}) VALUES`,
    ...rows.map((row, index) => {
      const suffix = index === rows.length - 1 ? ";" : ",";
      return `  (${columns.map((column) => sqlLiteral(row[column])).join(", ")})${suffix}`;
    })
  ];
}

const env = loadEnv(".env.local");
const sql = neon(env.DATABASE_URL);

const memberColumns = [
  "id",
  "nation",
  "crew_name",
  "nickname",
  "role_name",
  "job",
  "weapon",
  "helmet",
  "armor",
  "shoes",
  "soop_id",
  "created_at",
  "updated_at"
];

const castleColumns = [
  "id",
  "castle_key",
  "name",
  "kingdom",
  "level",
  "map_x",
  "map_y",
  "area_scale",
  "sort_order",
  "created_at",
  "updated_at",
  "is_use"
];

const chronicleColumns = [
  "id",
  "event_at",
  "nation",
  "content",
  "is_deleted",
  "author_name",
  "created_at",
  "approval_status",
  "reviewed_by_name",
  "reviewed_at"
];

const members = await sql`
  SELECT id, nation, crew_name, nickname, role_name, job, weapon, helmet, armor, shoes, soop_id,
         created_at::text, updated_at::text
  FROM public.member
  ORDER BY id
`;

const castles = await sql`
  SELECT id, castle_key, name, kingdom, level, map_x::text, map_y::text, area_scale::text, sort_order,
         created_at::text, updated_at::text, is_use
  FROM public.castle
  ORDER BY id
`;

const chronicles = await sql`
  SELECT id, event_at::text, nation, content, is_deleted, author_name, created_at::text,
         approval_status, reviewed_by_name, reviewed_at::text
  FROM public.chronicle
  ORDER BY id
`;

const lines = [
  "-- GC-ThreeKingdom pre-open initial data backup",
  "-- Created from Neon neondb on 2026-07-21",
  "-- Restore target: public.member, public.castle, public.chronicle",
  "-- Admin accounts and admin audit logs are intentionally excluded.",
  "",
  "BEGIN;",
  "",
  "TRUNCATE TABLE public.chronicle, public.castle, public.member RESTART IDENTITY;",
  "",
  "-- public.member",
  ...insertRows("member", memberColumns, members),
  "",
  "-- public.castle",
  ...insertRows("castle", castleColumns, castles),
  "",
  "-- public.chronicle",
  ...insertRows("chronicle", chronicleColumns, chronicles),
  "",
  "SELECT setval(pg_get_serial_sequence('public.member', 'id'), COALESCE((SELECT MAX(id) FROM public.member), 1), true);",
  "SELECT setval(pg_get_serial_sequence('public.castle', 'id'), COALESCE((SELECT MAX(id) FROM public.castle), 1), true);",
  "SELECT setval(pg_get_serial_sequence('public.chronicle', 'id'), COALESCE((SELECT MAX(id) FROM public.chronicle), 1), true);",
  "",
  "COMMIT;",
  ""
];

const outputDir = path.join("db", "backups");
fs.mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, "pre-open-initial-data-2026-07-21.sql");
fs.writeFileSync(outputPath, lines.join("\n"), "utf8");

console.log(JSON.stringify({
  outputPath,
  counts: {
    member: members.length,
    castle: castles.length,
    chronicle: chronicles.length
  }
}, null, 2));
