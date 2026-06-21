import { cookies } from "next/headers";
import Link from "next/link";
import { Radio, ScrollText, Swords } from "lucide-react";
import { HomeOverview, type ChronicleEntry } from "@/components/HomeOverview";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";
import { getSql } from "@/lib/db";


const baseCards = [
  { href: "/factions", title: "세력 정보", desc: "위, 촉, 오 세력의 특징과 운영 정보를 관리합니다.", icon: Swords },
  { href: "/broadcast", title: "지통실", desc: "방송, 공지, 전달 정보를 시각적으로 관리합니다.", icon: Radio }
];

type ChronicleRow = {
  nation: string;
  content: string;
  event_at: string;
};

export default async function HomePage() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  const sql = getSql();

  const chronicleRows = await sql.query(`
    SELECT
      nation,
      content,
      to_char(event_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS event_at
    FROM public.chronicle
    WHERE is_deleted = FALSE
    ORDER BY event_at ASC, id ASC
    LIMIT 20
  `) as ChronicleRow[];

  const chronicle: ChronicleEntry[] = chronicleRows.map((row) => ({
    nations: row.nation.split(",").map((value) => value.trim()).filter(Boolean),
    date: row.event_at,
    content: row.content
  }));

  const cards = [
    ...baseCards,
    session
      ? { href: "/admin/map", title: "영토 관리자", desc: "성 이름, 성 등급, 위치, 영역 배율을 직접 편집합니다.", icon: ScrollText }
      : { href: "/admin/login", title: "관리자 로그인", desc: "로그인한 경우에만 영토 관리자 메뉴가 활성화됩니다.", icon: ScrollText }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <HomeOverview chronicle={chronicle} />

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href} className="pixel-frame p-5 transition hover:border-[var(--accent)]">
              <Icon className="mb-4 text-[var(--accent)]" size={24} />
              <h2 className="mb-2 text-lg font-bold text-[#f3e7d0]">{card.title}</h2>
              <p className="text-sm leading-6 text-[var(--muted-foreground)]">{card.desc}</p>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
