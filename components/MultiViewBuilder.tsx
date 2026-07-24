"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, MonitorPlay, Search, X } from "lucide-react";
import { crewBadgeClassMap, nationConfigs } from "@/lib/factions-config";
import { BroadcastRefreshButton } from "@/components/BroadcastRefreshButton";

export type MultiViewMemberRow = {
  id: string;
  nation: string;
  crew_name: string;
  nickname: string;
  soop_id: string;
  is_live: boolean;
  viewer_count: number | null;
};

const nationOrder = ["위나라", "촉나라", "오나라"] as const;
const maxSelectedMembers = 4;

const nationBadgeClassMap = Object.fromEntries(
  nationConfigs.map((nation) => [
    nation.key,
    nation.key === "위나라"
      ? "bg-[#2f73c8]/22 text-[#dcecff] ring-[#2f73c8]/45"
      : nation.key === "촉나라"
        ? "bg-[#2f9b5f]/22 text-[#ddffea] ring-[#2f9b5f]/45"
        : "bg-[#d4a017]/24 text-[#fff0b8] ring-[#d4a017]/48"
  ])
) as Record<string, string>;

function getProfileImageUrl(soopId: string) {
  const prefix = soopId.slice(0, 2).toLowerCase();
  return `https://stimg.sooplive.com/LOGO/${prefix}/${soopId}/${soopId}.jpg`;
}

function buildMultiViewUrl(soopIds: string[]) {
  return `https://mul.live/${soopIds.map((soopId) => encodeURIComponent(soopId)).join("/")}`;
}

export function MultiViewBuilder({ initialMembers }: { initialMembers: MultiViewMemberRow[] }) {
  const [selectedNation, setSelectedNation] = useState("");
  const [selectedCrew, setSelectedCrew] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (!toastMessage) return;

    const timer = window.setTimeout(() => {
      setToastMessage("");
    }, 2200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toastMessage]);

  const crewOptions = useMemo(
    () => [...new Set(initialMembers.map((member) => member.crew_name))].sort((left, right) => left.localeCompare(right, "ko")),
    [initialMembers]
  );

  const filteredMembers = useMemo(() => {
    return initialMembers.filter((member) => {
      if (selectedNation && member.nation !== selectedNation) return false;
      if (selectedCrew && member.crew_name !== selectedCrew) return false;
      if (searchKeyword && !member.nickname.toLowerCase().includes(searchKeyword.toLowerCase())) return false;
      return true;
    });
  }, [initialMembers, searchKeyword, selectedCrew, selectedNation]);

  const selectedMembers = useMemo(() => {
    const selectedSet = new Set(selectedIds);
    return initialMembers.filter((member) => member.is_live && selectedSet.has(member.id));
  }, [initialMembers, selectedIds]);

  const liveCount = useMemo(() => filteredMembers.filter((member) => member.is_live).length, [filteredMembers]);

  function toggleMember(member: MultiViewMemberRow) {
    if (!member.is_live) return;

    setSelectedIds((current) => {
      if (current.includes(member.id)) {
        return current.filter((item) => item !== member.id);
      }

      if (current.length >= maxSelectedMembers) {
        setToastMessage(`멀티뷰는 최대 ${maxSelectedMembers}명까지만 선택할 수 있습니다.`);
        return current;
      }

      return [...current, member.id];
    });
  }

  function openMultiView() {
    if (selectedMembers.length === 0) return;
    const url = buildMultiViewUrl(selectedMembers.map((member) => member.soop_id));
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <section className="pixel-frame p-8">
        <div>
          <p className="mb-2 text-xs font-bold tracking-[0.24em] text-[var(--accent)]">MULTIVIEW</p>
          <h1 className="text-2xl font-black text-[#f3e7d0]">멀티뷰</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">
            멤버를 선택한 뒤 멀티뷰 보기를 누르면 선택한 SOOP 방송국이 한 번에 새 창으로 열립니다.
          </p>
        </div>

        <div className="mt-6 border-t border-[var(--border)] pt-5">
          <div className="text-xs font-bold tracking-[0.18em] text-[#dbc292]">나라 필터</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedNation("")}
              className={`rounded-full px-3 py-1.5 text-sm font-bold ring-1 transition ${
                !selectedNation
                  ? "bg-[#d4a017]/16 text-[#f7d79d] ring-[#d4a756]/45"
                  : "bg-white/5 text-[#cdbb98] ring-white/10 hover:bg-white/10"
              }`}
            >
              전체
            </button>
            {nationOrder.map((nation) => (
              <button
                key={nation}
                type="button"
                onClick={() => {
                  setSelectedNation(nation);
                  setSelectedCrew("");
                }}
                className={`rounded-full px-3 py-1.5 text-sm font-bold ring-1 transition ${
                  selectedNation === nation
                    ? nationBadgeClassMap[nation]
                    : "bg-white/5 text-[#cdbb98] ring-white/10 hover:bg-white/10"
                }`}
              >
                {nation}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <div className="text-xs font-bold tracking-[0.18em] text-[#dbc292]">크루 필터</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCrew("")}
              className={`rounded-full px-3 py-1.5 text-sm font-bold ring-1 transition ${
                !selectedCrew
                  ? "bg-[#d4a017]/16 text-[#f7d79d] ring-[#d4a756]/45"
                  : "bg-white/5 text-[#cdbb98] ring-white/10 hover:bg-white/10"
              }`}
            >
              전체
            </button>
            {crewOptions.map((crew) => {
              const crewBadgeClass = crewBadgeClassMap[crew] ?? "bg-white/10 text-[#f3e7d0] ring-white/10";

              return (
                <button
                  key={crew}
                  type="button"
                  onClick={() => {
                    setSelectedCrew(crew);
                    setSelectedNation("");
                  }}
                  className={`rounded-full px-3 py-1.5 text-sm font-bold ring-1 transition ${
                    selectedCrew === crew
                      ? crewBadgeClass
                      : "bg-white/5 text-[#cdbb98] ring-white/10 hover:bg-white/10"
                  }`}
                >
                  {crew}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5">
          <label className="text-xs font-bold tracking-[0.18em] text-[#dbc292]" htmlFor="multiview-search">
            이름 검색
          </label>
          <div className="mt-3 flex h-11 items-center gap-3 rounded-full border border-[rgba(212,167,86,0.22)] bg-black/40 px-4">
            <Search size={16} className="text-[#8e7c62]" />
            <input
              id="multiview-search"
              type="text"
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="이름 검색"
              className="h-full w-full bg-transparent text-sm font-medium text-[#f3e7d0] outline-none placeholder:text-[#8e7c62]"
            />
          </div>
        </div>
      </section>

      <section className="mt-4 flex items-center gap-3">
        <div className="text-sm font-bold text-[#dbc292]">
          총 {filteredMembers.length}명 중 {liveCount}명 방송 중
        </div>
        <BroadcastRefreshButton />
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {filteredMembers.map((member) => {
          const active = member.is_live && selectedIds.includes(member.id);
          const disabled = !member.is_live;
          const nationBadgeClass = nationBadgeClassMap[member.nation] ?? "bg-white/10 text-[#f3e7d0] ring-white/10";
          const crewBadgeClass = crewBadgeClassMap[member.crew_name] ?? "bg-white/10 text-[#f3e7d0] ring-white/10";
          const profileUrl = getProfileImageUrl(member.soop_id);

          return (
            <button
              key={member.id}
              type="button"
              onClick={() => toggleMember(member)}
              disabled={disabled}
              aria-disabled={disabled}
              className={`pixel-frame multiview-member-card overflow-hidden p-4 text-left transition ${
                active
                  ? "border-[rgba(212,167,86,0.65)] bg-[rgba(212,167,86,0.12)]"
                  : disabled
                    ? "cursor-not-allowed opacity-60 grayscale"
                    : "hover:border-[rgba(212,167,86,0.3)]"
              }`}
            >
              <div className="flex items-start gap-3">
                <img
                  src={profileUrl}
                  alt={`${member.nickname} 프로필`}
                  loading="lazy"
                      className="h-16 w-16 rounded-full border border-[rgba(212,167,86,0.24)] bg-black object-cover"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-base font-black text-[#f3e7d0]">{member.nickname}</div>
                    </div>
                    <span
                      className={`mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border ${
                        active
                          ? "border-[rgba(212,167,86,0.48)] bg-[rgba(212,167,86,0.2)] text-[#ffecbf]"
                          : disabled
                            ? "border-white/5 bg-white/5 text-transparent"
                            : "border-white/10 bg-white/5 text-transparent"
                      }`}
                    >
                      <Check size={14} strokeWidth={3} />
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${nationBadgeClass}`}>
                      {member.nation}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${crewBadgeClass}`}>
                      {member.crew_name}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}

        {filteredMembers.length === 0 ? (
          <div className="pixel-frame col-span-full p-8 text-center text-sm text-[#dbc292]">
            선택한 조건에 맞는 멤버가 없습니다.
          </div>
        ) : null}
      </section>

      <aside className="multiview-floating-panel">
        <div className="multiview-floating-head">
          <div className="shrink-0 text-sm font-black text-[#f3e7d0]">선택된 멤버 {selectedMembers.length}명</div>

          {selectedMembers.length > 0 ? (
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-[#cdb487] transition hover:bg-white/10 hover:text-[#f3e7d0]"
              aria-label="선택 초기화"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>

        <div className="multiview-floating-members">
          {selectedMembers.length > 0 ? (
            selectedMembers.map((member) => (
              <button
                key={`floating-${member.id}`}
                type="button"
                onClick={() => toggleMember(member)}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,167,86,0.24)] bg-white/5 px-3 py-1.5 text-sm font-bold text-[#f3e7d0]"
              >
                <span>{member.nickname}</span>
                <span className="flex items-center text-[#caa160]">
                  <X size={13} />
                </span>
              </button>
            ))
          ) : (
            <div className="text-sm leading-6 text-[var(--muted-foreground)]">프로필 이미지를 눌러 멤버를 선택하세요.</div>
          )}
        </div>

        <button
          type="button"
          onClick={openMultiView}
          disabled={selectedMembers.length === 0}
          className="multiview-floating-action"
        >
          <MonitorPlay size={18} />
          멀티뷰 보기
        </button>
      </aside>

      {toastMessage ? (
        <div className="multiview-toast-alert">
          {toastMessage}
        </div>
      ) : null}
    </>
  );
}
