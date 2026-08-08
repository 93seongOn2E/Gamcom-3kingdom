"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ThreeKingdomSeason } from "@/lib/season";
import { getNationDisplayName } from "@/lib/nation-display";

const nationOptions = [
  { key: "위나라", slug: "위", color: "#2f73c8" },
  { key: "촉나라", slug: "촉", color: "#2f9b5f" },
  { key: "오나라", slug: "오", color: "#d4a017" }
] as const;

type NationOption = (typeof nationOptions)[number];

export function NationEquipmentSelector({ season }: { season: ThreeKingdomSeason }) {
  const router = useRouter();
  const [pendingNation, setPendingNation] = useState<NationOption | null>(null);

  function confirmSelection() {
    if (!pendingNation) {
      return;
    }
    router.push(`/factions/${pendingNation.slug}?season=${season}`);
  }

  return (
    <>
      <section className="pixel-frame mx-auto w-full max-w-xl overflow-hidden">
        <div className="border-b border-[var(--border)] px-5 py-5 text-center">
          <h2 className="text-xl font-extrabold text-[#f3e7d0]">확인할 국가를 선택해주세요</h2>
          <p className="mt-2 text-sm font-medium text-[#aa9a82]">선택을 확인한 뒤 해당 국가의 내실현황만 불러옵니다.</p>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-3">
          {nationOptions.map((nation) => (
            <button
              key={nation.key}
              type="button"
              onClick={() => setPendingNation(nation)}
              className="rounded-lg border px-4 py-4 text-base font-black text-white transition duration-150 hover:-translate-y-0.5 hover:brightness-110"
              style={{ borderColor: nation.color, backgroundColor: nation.color }}
            >
              {getNationDisplayName(nation.key, season)}
            </button>
          ))}
        </div>
      </section>

      {pendingNation ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="nation-confirm-title"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              setPendingNation(null);
            }
          }}
        >
          <div className="pixel-frame w-full max-w-sm overflow-hidden bg-[#17130e] shadow-2xl">
            <div className="border-b border-[var(--border)] px-6 py-5 text-center">
              <div className="mx-auto mb-3 h-2 w-16" style={{ backgroundColor: pendingNation.color }} />
              <h3 id="nation-confirm-title" className="text-xl font-black text-[#f3e7d0]">
                {getNationDisplayName(pendingNation.key, season)} 내실현황
              </h3>
              <p className="mt-2 text-sm font-medium text-[#aa9a82]">이 국가의 내실현황을 확인하시겠습니까?</p>
            </div>
            <div className="grid grid-cols-2 gap-3 p-5">
              <button
                type="button"
                onClick={() => setPendingNation(null)}
                className="rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 font-bold text-[#cdbb98] hover:bg-white/10"
              >
                취소
              </button>
              <button
                type="button"
                onClick={confirmSelection}
                className="rounded-lg border px-4 py-2.5 font-black text-white hover:brightness-110"
                style={{ borderColor: pendingNation.color, backgroundColor: pendingNation.color }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
