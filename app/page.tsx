import Link from "next/link";
import { BookOpen, ScrollText, Shield, Swords } from "lucide-react";
import { MapViewer } from "@/components/MapViewer";

const chronicle = [
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

const cards = [
  { href: "/heroes", title: "장수 도감", desc: "서버에 등장하는 장수와 역할을 정리합니다.", icon: Swords },
  { href: "/factions", title: "세력 정보", desc: "위, 촉, 오 세력의 특징과 운영 정보를 관리합니다.", icon: Shield },
  { href: "/items", title: "아이템", desc: "전투, 경제, 퀘스트 아이템 정보를 정리합니다.", icon: BookOpen },
  { href: "/admin/map", title: "영토 관리자", desc: "성 이름, 레벨, 위치, 영역 배율을 직접 편집합니다.", icon: ScrollText }
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <section className="home-overview grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.6fr)_340px]">
        <div className="home-overview-map flex h-full flex-col">
          <MapViewer compact />
        </div>

        <aside className="pixel-frame chronicle-panel p-5 md:p-6">
          <div className="mb-5">
            <p className="mb-2 text-xs font-bold tracking-[0.24em] text-[var(--accent)]">CHRONICLE</p>
            <h2 className="text-2xl font-black text-[#f3e7d0]">연대기</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              세력별 공성전, 방어전, 점령 결과를 날짜순으로 정리합니다.
            </p>
          </div>

          <div className="chronicle-list">
            {chronicle.map((entry, index) => (
              <article key={`${entry.force}-${entry.date}-${index}`} className="chronicle-item">
                <div className="chronicle-meta">
                  <time className="chronicle-date">{entry.date}</time>
                  <span className={`chronicle-force ${entry.force === "위" ? "wei" : entry.force === "촉" ? "shu" : "wu"}`}>
                    {entry.force}나라
                  </span>
                </div>
                <p className="chronicle-content">{entry.content}</p>
              </article>
            ))}
          </div>
        </aside>
      </section>

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
