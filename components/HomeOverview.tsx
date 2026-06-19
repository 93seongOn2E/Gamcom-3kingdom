"use client";

import { useEffect, useRef, useState } from "react";
import { MapViewer } from "@/components/MapViewer";

export type ChronicleEntry = {
  force: "위" | "촉" | "오";
  date: string;
  content: string;
};

export function HomeOverview({ chronicle }: { chronicle: ChronicleEntry[] }) {
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
        <MapViewer compact />
      </div>

      <aside className="pixel-frame chronicle-panel p-5 md:p-6" style={mapHeight ? { height: `${mapHeight}px` } : undefined}>
        <div className="mb-5">
          <h2 className="text-2xl font-black text-[#f3e7d0]">연대기</h2>
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
  );
}
