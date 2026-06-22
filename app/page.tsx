import Link from "next/link";
import { Radio, ScrollText, Swords } from "lucide-react";
import { HomeOverview } from "@/components/HomeOverview";
import { getCachedCastleData, getCachedChronicleData } from "@/lib/public-data";


const baseCards = [
  { href: "/factions", title: "세력 정보", desc: "위, 촉, 오 세력의 특징과 운영 정보를 관리합니다.", icon: Swords },
  { href: "/broadcast", title: "지통실", desc: "방송, 공지, 전달 정보를 시각적으로 관리합니다.", icon: Radio }
];

export default async function HomePage() {
  const [chronicle, castleData] = await Promise.all([
    getCachedChronicleData(),
    getCachedCastleData()
  ]);

  const cards = [
    ...baseCards,
    { href: "/admin/login", title: "관리자 로그인", desc: "로그인한 경우에만 영토 관리자 메뉴가 활성화됩니다.", icon: ScrollText }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <HomeOverview chronicle={chronicle} castleData={castleData} />

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
