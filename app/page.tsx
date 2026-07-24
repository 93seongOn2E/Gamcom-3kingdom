import Link from "next/link";
import { BookOpen, Monitor, Radio } from "lucide-react";
import { HomeOverview } from "@/components/HomeOverview";
import { TeaserVideoModal } from "@/components/TeaserVideoModal";
import { getCachedCastleData, getCachedChronicleData } from "@/lib/public-data";


const baseCards = [
  { href: "/jobs", title: "직업소개", desc: "일반 직업과 히든 직업의 스킬 정보를 확인합니다.", icon: BookOpen },
  { href: "/broadcast", title: "지통실", desc: "방송, 공지, 전달 정보를 시각적으로 관리합니다.", icon: Radio }
];

export default async function HomePage() {
  const [chronicle, castleData] = await Promise.all([
    getCachedChronicleData(),
    getCachedCastleData()
  ]);

  const cards = [
    ...baseCards,
    { href: "/multiview", title: "멀티뷰", desc: "방송 중인 멤버를 선택해 여러 방송을 한 번에 확인합니다.", icon: Monitor }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <TeaserVideoModal />
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
