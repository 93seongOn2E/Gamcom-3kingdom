"use client";

import { useEffect, useRef, useState } from "react";
import { MapViewer } from "@/components/MapViewer";
import type { CastleDataPayload } from "@/lib/public-data";

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

export function HomeOverview({ chronicle, castleData }: { chronicle: ChronicleEntry[]; castleData: CastleDataPayload }) {
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
    <section className="home-overview grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.6fr)_340px]">
      <div ref={mapRef} className="home-overview-map flex h-full flex-col">
        <MapViewer compact initialData={castleData} />
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

              <p className="chronicle-content">{entry.content}</p>
            </article>
          ))}
        </div>
      </aside>
    </section>
  );
}
