"use client";

import { useEffect, useRef, useState } from "react";
import { MapViewer } from "@/components/MapViewer";
import type { CastleDataPayload } from "@/lib/public-data";
import type { ThreeKingdomSeason } from "@/lib/season";

export type ChronicleEntry = {
  nations: string[];
  date: string;
  content: string;
};

function getNationThemeClass(nation: string) {
  if (nation === "위나라") return "wei";
  if (nation === "촉나라") return "shu";
  if (nation === "오나라") return "wu";
  return "neutral";
}

function renderChronicleContent(content: string) {
  return content.split(/(위나라|촉나라|오나라)/g).map((part, index) => {
    const isNation = part === "위나라" || part === "촉나라" || part === "오나라";

    return isNation ? (
      <span key={`${part}-${index}`} className={`chronicle-inline-nation ${getNationThemeClass(part)}`}>
        {part}
      </span>
    ) : part;
  });
}

const siegeRules = [
  {
    title: "신규 점령 영토의 보호",
    items: [
      "점령한 영토의 거점은 장원으로 건설되며 24시간의 보호시간을 갖습니다.",
      "24시간의 보호시간 동안은 거점 형태를 변경할 수 없고, 성문과 수호석이 보호됩니다."
    ]
  },
  {
    title: "공성 보상",
    items: [
      "성문, 수호석 파괴 보상은 지급되지 않으며 땅 개수에 따른 공격력 증가 효과만 유지됩니다."
    ]
  },
  {
    title: "공성 후 점령에 대한 제한",
    items: [
      "수호석이 파괴된 영토의 기존 소유국은 황무지가 된 해당 영토를 5분간 구매할 수 없습니다.",
      "재구매 제한시간 중에도 해당 영토의 점령 방어는 가능합니다."
    ]
  },
  {
    title: "영토 내 사망",
    items: [
      "영토 채널에서 사망할 경우, 기존 5초가 아닌 10초의 부활 대기시간이 적용됩니다."
    ]
  },
  {
    title: "거점 형태에 따른 체력 조정",
    items: [
      "성채 > 장원 > 병영 순서로 높은 체력을 가집니다.",
      "모든 거점의 성문, 수호석 체력이 조정됩니다."
    ]
  }
];

export function HomeOverview({
  chronicle,
  castleData,
  season
}: {
  chronicle: ChronicleEntry[];
  castleData: CastleDataPayload;
  season: ThreeKingdomSeason;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [mapHeight, setMapHeight] = useState<number | null>(null);

  useEffect(() => {
    const element = mapRef.current;
    if (!element) return;

    const updateHeight = () => {
      const mapCard = element.querySelector(".map-viewer-shell.compact");
      const target = mapCard instanceof HTMLElement ? mapCard : element;
      setMapHeight(target.getBoundingClientRect().height);
    };

    updateHeight();

    const observer = new ResizeObserver(() => {
      updateHeight();
    });

    observer.observe(element);
    window.addEventListener("resize", updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  return (
    <div className="home-overview-container">
      <div className="home-overview-stage">
        <section
          className="home-overview grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.6fr)_340px]"
        >
          <div ref={mapRef} className="home-overview-map flex h-full flex-col">
            <MapViewer compact initialData={castleData} season={season} />
          </div>

          <aside className="pixel-frame chronicle-panel p-5 md:p-6" style={mapHeight ? { height: `${mapHeight}px` } : undefined}>
            <div className="mb-5">
              <h2 className="text-2xl font-black text-[#f3e7d0]">연대기</h2>
            </div>

            <div className="chronicle-list">
              {chronicle.map((entry, index) => (
                <article key={`${entry.date}-${entry.content}-${index}`} className="chronicle-item">
                  <time className="chronicle-date">{entry.date}</time>

                  <div className="chronicle-meta">
                    {entry.nations.map((nation) => (
                      <span
                        key={`${entry.date}-${nation}-${index}`}
                        className={`chronicle-force ${getNationThemeClass(nation)}`}
                      >
                        {nation}
                      </span>
                    ))}
                  </div>

                  <p className="chronicle-content">{renderChronicleContent(entry.content)}</p>
                </article>
              ))}
            </div>
          </aside>
        </section>

        <section className="pixel-frame siege-rules-panel" aria-labelledby="siege-rules-title">
          <div className="siege-rules-head">
            <span>공성전 규칙</span>
            <h2 id="siege-rules-title">영토 점령 및 공성 규칙 안내</h2>
            <p>전쟁 기간은 8월 7일 00시부터 시작되며 다음과 같은 규칙으로 진행됩니다.</p>
          </div>

          <div className="siege-rules-list">
            {siegeRules.map((rule, index) => (
              <article key={rule.title} className="siege-rule-card">
                <div className="siege-rule-number">{index + 1}</div>
                <div>
                  <h3>{rule.title}</h3>
                  <ul>
                    {rule.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
