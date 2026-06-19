import { cookies } from "next/headers";
import Link from "next/link";
import { BookOpen, Radio, ScrollText, Swords } from "lucide-react";
import { HomeOverview, type ChronicleEntry } from "@/components/HomeOverview";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";

const chronicle: ChronicleEntry[] = [
  { force: "위", date: "2026-06-12", content: "촉나라 한중성 공격 결과 실패" },
  { force: "촉", date: "2026-06-12", content: "오나라 강릉성 방어전 승리" },
  { force: "오", date: "2026-06-13", content: "위나라 합비성 1차 공성전 진입" },
  { force: "위", date: "2026-06-14", content: "촉나라 검각성 포위 후 철수" },
  { force: "촉", date: "2026-06-15", content: "오나라 무릉성 기습 점령 성공" },
  { force: "오", date: "2026-06-16", content: "위나라 수춘성 연합 공격 준비" },
  { force: "위", date: "2026-06-17", content: "촉나라 양평관 정찰전 결과 병력 일부 후퇴" },
  { force: "촉", date: "2026-06-17", content: "오나라 건업성 보급로 차단 작전 개시" },
  { force: "오", date: "2026-06-18", content: "위나라 여남성 외곽 거점 선점 성공" },
  { force: "위", date: "2026-06-18", content: "촉나라 성도성 북문 공성 결과 무승부" },
  { force: "촉", date: "2026-06-19", content: "오나라 장사성 야간 기습 방어 성공" },
  { force: "오", date: "2026-06-19", content: "위나라 하비성 인근 집결 완료 후 총공세 예고" },
  { force: "위", date: "2026-06-20", content: "촉나라 한수 일대 전초기지 파괴 및 전선 확장" },
  { force: "촉", date: "2026-06-20", content: "오나라 시상성 남부 성문 공격 결과 실패" },
  { force: "오", date: "2026-06-21", content: "위나라 수비 연합 붕괴로 합비성 외곽 진입" },
  { force: "위", date: "2026-06-21", content: "촉나라 검문소 점령 후 병참선 재정비" },
  { force: "촉", date: "2026-06-22", content: "오나라 여강성 보급 창고 습격 성공" },
  { force: "오", date: "2026-06-22", content: "위나라 공성 병기 집결 확인 및 방어 태세 강화" }
];

const baseCards = [
  { href: "/factions", title: "세력 정보", desc: "위, 촉, 오 세력의 특징과 운영 정보를 관리합니다.", icon: Swords },
  { href: "/items", title: "지통실", desc: "방송, 공지, 전달용 정보를 한곳에서 관리합니다.", icon: Radio },
];

export default async function HomePage() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  const cards = [
    ...baseCards,
    session
      ? { href: "/admin/map", title: "영토 관리자", desc: "성 이름, 레벨, 위치, 영역 배율을 직접 편집합니다.", icon: ScrollText }
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
