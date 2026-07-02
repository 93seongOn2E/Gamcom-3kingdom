"use client";

import { useMemo, useState } from "react";
import { crewBadgeClassMap, getHiddenJobBadge, nationConfigs } from "@/lib/factions-config";
import { BroadcastRefreshButton } from "@/components/BroadcastRefreshButton";

export type MemberBroadcastRow = {
  id: string;
  nation: string;
  crew_name: string;
  nickname: string;
  soop_id: string;
  is_live: boolean;
  thumbnail_image_url: string | null;
  broadcast_title: string | null;
  viewer_count: number | null;
  job: string | null;
};

const nationOrder = ["위나라", "촉나라", "오나라"] as const;

const nationBadgeClassMap = Object.fromEntries(
  nationConfigs.map((nation) => [
    nation.key,
    nation.key === "위나라"
      ? "bg-[#2f73c8]/22 text-[#dcecff] ring-[#2f73c8]/45"
      : nation.key === "촉나라"
        ? "bg-[#2f9b5f]/22 text-[#ddffea] ring-[#2f9b5f]/45"
        : "bg-[#d63d35]/22 text-[#ffe0dd] ring-[#d63d35]/45"
  ])
) as Record<string, string>;

function getStationUrl(soopId: string) {
  return `https://www.sooplive.com/station/${soopId}`;
}

function getPlayUrl(soopId: string) {
  return `https://play.sooplive.com/${soopId}`;
}

function getProfileImageUrl(soopId: string) {
  const prefix = soopId.slice(0, 2).toLowerCase();
  return `https://stimg.sooplive.com/LOGO/${prefix}/${soopId}/${soopId}.jpg`;
}

function getThumbnailUrl(member: MemberBroadcastRow) {
  if (member.is_live && member.thumbnail_image_url) {
    return member.thumbnail_image_url;
  }

  return "/assets/soop-offline-placeholder.svg";
}

export function BroadcastDirectory({ initialMembers }: { initialMembers: MemberBroadcastRow[] }) {
  const [selectedNation, setSelectedNation] = useState("");
  const [selectedCrew, setSelectedCrew] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const crewOptions = useMemo(
    () => [...new Set(initialMembers.map((member) => member.crew_name))].sort((left, right) => left.localeCompare(right, "ko")),
    [initialMembers]
  );

  const members = useMemo(() => {
    return initialMembers.filter((member) => {
      if (selectedNation && member.nation !== selectedNation) return false;
      if (selectedCrew && member.crew_name !== selectedCrew) return false;
      if (searchKeyword && !member.nickname.toLowerCase().includes(searchKeyword.toLowerCase())) return false;
      return true;
    });
  }, [initialMembers, searchKeyword, selectedCrew, selectedNation]);

  const liveCount = useMemo(() => members.filter((member) => member.is_live).length, [members]);

  return (
    <>
      <section className="pixel-frame p-8">
        <div className="mb-3">
          <h1 className="text-2xl font-black text-[#f3e7d0]">지통실</h1>
        </div>
        <p className="text-sm leading-7 text-[#aa9a82]">
          감컴퍼니 삼국지서버 참여 인원의 방송국을 한눈에 확인할 수 있는 페이지입니다.
        </p>

        <div className="mt-6 border-t border-[var(--border)] pt-5">
          <div className="text-xs font-bold tracking-[0.18em] text-[#dbc292]">나라 필터</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedNation("");
                setSelectedCrew("");
              }}
              className={`rounded-full px-3 py-1.5 text-sm font-bold ring-1 transition ${
                !selectedNation && !selectedCrew
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
              onClick={() => {
                setSelectedNation("");
                setSelectedCrew("");
              }}
              className={`rounded-full px-3 py-1.5 text-sm font-bold ring-1 transition ${
                !selectedNation && !selectedCrew
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
                    selectedCrew === crew ? crewBadgeClass : "bg-white/5 text-[#cdbb98] ring-white/10 hover:bg-white/10"
                  }`}
                >
                  {crew}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="text-sm font-bold text-[#dbc292]">
            총 {members.length}명 중 {liveCount}명 방송 중
          </div>
          <BroadcastRefreshButton />
        </div>

        <div className="w-full max-w-md md:w-auto md:min-w-[280px]">
          <input
            type="text"
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            placeholder="이름 검색"
            className="h-10 w-full rounded-full border border-[rgba(212,167,86,0.22)] bg-black/40 px-4 text-sm font-medium text-[#f3e7d0] outline-none placeholder:text-[#8e7c62]"
          />
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {members.map((member) => {
          const nationBadgeClass = nationBadgeClassMap[member.nation] ?? "bg-white/10 text-[#f3e7d0] ring-white/10";
          const crewBadgeClass = crewBadgeClassMap[member.crew_name] ?? "bg-white/10 text-[#f3e7d0] ring-white/10";
          const thumbnailUrl = getThumbnailUrl(member);
          const profileUrl = getProfileImageUrl(member.soop_id);
          const broadcastTitle = member.broadcast_title?.trim() || `${member.nickname} 방송국`;
          const viewerCount = member.viewer_count ?? 0;
          const hiddenJob = getHiddenJobBadge(member.job);

          return (
            <article key={member.id} className="pixel-frame overflow-hidden bg-[#111111]/90">
              <a
                href={member.is_live ? getPlayUrl(member.soop_id) : getStationUrl(member.soop_id)}
                target="_blank"
                rel="noreferrer"
                className="group block"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-black">
                  <img
                    src={thumbnailUrl}
                    alt={`${member.nickname} 방송 썸네일`}
                    loading="lazy"
                    className={`h-full w-full object-cover transition duration-300 group-hover:scale-[1.02] ${member.is_live ? "" : "opacity-90"}`}
                  />

                  <div className="absolute inset-x-0 top-0 flex items-center justify-start p-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/72 px-2.5 py-1 text-[12px] font-bold leading-none text-[#f3e7d0] ring-1 ring-white/10">
                      <span className="block h-[7px] w-[7px] shrink-0 rounded-full bg-[#c7392f]" />
                      {viewerCount.toLocaleString("ko-KR")}
                    </span>
                  </div>

                  {!member.is_live ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <div className="px-4 text-center text-sm font-extrabold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.8)]">
                        스트리머가 오프라인입니다.
                      </div>
                    </div>
                  ) : null}
                </div>
              </a>

              <div className="flex gap-3 p-3">
                <a href={getStationUrl(member.soop_id)} target="_blank" rel="noreferrer" className="shrink-0">
                  <img
                    src={profileUrl}
                    alt={`${member.nickname} 프로필`}
                    loading="lazy"
                    className="h-11 w-11 rounded-full border border-[rgba(212,167,86,0.24)] object-cover bg-black"
                  />
                </a>

                <div className="min-w-0 flex-1">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-black text-[#dbc292]">{member.nickname}</div>
                    <div className="mt-1 truncate text-[13px] font-bold leading-5 text-[#f3e7d0]">{broadcastTitle}</div>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${nationBadgeClass}`}>
                      {member.nation}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${crewBadgeClass}`}>
                      {member.crew_name}
                    </span>
                    {member.job ? (
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${
                        hiddenJob ? hiddenJob.className : "border border-[rgba(212,167,86,0.28)] bg-white/5 text-[#dbc292]"
                      }`}>
                        {member.job}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
          );
        })}

        {members.length === 0 ? (
          <div className="pixel-frame col-span-full p-8 text-center text-sm text-[#dbc292]">
            선택한 필터에 해당하는 방송국이 없습니다.
          </div>
        ) : null}
      </section>
    </>
  );
}
