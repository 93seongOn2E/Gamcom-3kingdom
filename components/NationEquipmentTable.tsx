"use client";

import { canEquipHeadArmor } from "@/lib/equipment-config";
import { crewBadgeClassMap, formatJobDisplayName, getHiddenJobBadge } from "@/lib/factions-config";
import { Fragment, useMemo, useState } from "react";

export type EquipmentMemberRow = {
  nation: string;
  crew_name: string;
  nickname: string;
  job: string | null;
  horse: string | null;
  horse_level: number;
  weapon: number | null;
  helmet: number | null;
  armor: number | null;
  shoes: number | null;
  stat_strength: number;
  stat_agility: number;
  stat_vitality: number;
  stat_intelligence: number;
};

type SortKey =
  | "crew_name"
  | "nickname"
  | "job"
  | "horse"
  | "weapon"
  | "helmet"
  | "armor"
  | "shoes"
  | "stat_strength"
  | "stat_agility"
  | "stat_vitality"
  | "stat_intelligence";

type SortDirection = "asc" | "desc";

function formatValue(value: number | null) {
  return value == null ? "-" : value;
}

function formatHeadArmor(job: string | null, value: number | null) {
  return canEquipHeadArmor(job) ? formatValue(value) : "-";
}

function formatHorseName(horse: string | null, horseLevel = 0) {
  const value = horse?.trim();
  if (!value) return "-";
  return horseLevel > 0 ? `${value} +${horseLevel}` : value;
}

function getHorseBadgeClass(horse: string | null) {
  return horse?.trim() === "적토마"
    ? "bg-[#b4312b] text-white ring-[#ff7a70]/45 shadow-[0_0_14px_rgba(180,49,43,0.24)]"
    : "bg-white/[0.05] text-[#dbc292] ring-white/[0.10]";
}

function EquipmentValue({ value }: { value: number | string }) {
  const isNumber = typeof value === "number";
  const isZero = value === 0;

  return (
    <span
      className={`inline-flex min-w-7 items-center justify-center rounded-md px-1.5 py-0.5 tabular-nums ${
        isNumber
          ? isZero
            ? "bg-white/[0.025] font-bold text-[#9b8b71]"
            : "bg-[#d4a756]/10 font-black text-[#fff1d3] ring-1 ring-[#d4a756]/20"
          : "font-medium text-[#756a58]"
      }`}
    >
      {value}
    </span>
  );
}

function getSortValue(member: EquipmentMemberRow, key: SortKey) {
  if (key === "helmet") {
    return canEquipHeadArmor(member.job) ? member.helmet : null;
  }

  if (key === "horse") {
    return member.horse ? `${member.horse}-${String(member.horse_level).padStart(2, "0")}` : null;
  }

  return member[key];
}

function compareValues(left: string | number | null, right: string | number | null, direction: SortDirection) {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;

  const result = typeof left === "number" && typeof right === "number"
    ? left - right
    : String(left).localeCompare(String(right), "ko", { numeric: true });

  return direction === "asc" ? result : -result;
}

function SortHeader({
  label,
  sortKey,
  activeKey,
  direction,
  separated = false,
  onSort
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey | null;
  direction: SortDirection;
  separated?: boolean;
  onSort: (key: SortKey) => void;
}) {
  const isActive = activeKey === sortKey;
  const sortIcon = isActive ? (direction === "asc" ? "▲" : "▼") : "⇅";
  const nextDirection = isActive && direction === "asc" ? "내림차순" : "오름차순";

  return (
    <th className={`whitespace-nowrap px-1 py-3 text-center text-[11px] font-extrabold tracking-[0.02em] ${separated ? "border-l border-[rgba(212,167,86,0.34)]" : ""}`}>
      <button
        type="button"
        title={`${label} ${nextDirection} 정렬`}
        aria-label={`${label} ${nextDirection} 정렬`}
        className={`inline-flex min-h-7 items-center justify-center gap-0.5 rounded-md px-1 transition-all hover:bg-white/[0.05] hover:text-[#f0bd58] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a756]/60 ${isActive ? "bg-[#d4a756]/10 text-[#f0bd58]" : ""}`}
        onClick={() => onSort(sortKey)}
      >
        <span>{label}</span>
        <span className={`w-3.5 text-[10px] ${isActive ? "text-[#f0bd58]" : "text-[#7f7059]"}`}>{sortIcon}</span>
      </button>
    </th>
  );
}

export function NationEquipmentTable({
  rows,
  emptySlotCount,
  showStats
}: {
  rows: EquipmentMemberRow[];
  emptySlotCount: number;
  showStats: boolean;
}) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;

    return rows
      .map((member, index) => ({ member, index }))
      .sort((left, right) => {
        const result = compareValues(
          getSortValue(left.member, sortKey),
          getSortValue(right.member, sortKey),
          sortDirection
        );
        return result || left.index - right.index;
      })
      .map(({ member }) => member);
  }, [rows, sortDirection, sortKey]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((current) => current === "asc" ? "desc" : "asc");
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  }

  return (
    <div className="equipment-table-scroll overflow-x-auto">
      <table className={`equipment-table border-collapse text-[13px] leading-5 ${showStats ? "min-w-[900px] table-fixed" : "w-full min-w-full table-fixed"}`}>
        {showStats ? (
          <colgroup>
            <col className="w-[120px]" />
            <col className="w-[90px]" />
            <col className="w-[120px]" />
            <col className="w-[85px]" />
            <col className="w-[62px]" />
            <col className="w-[62px]" />
            <col className="w-[62px]" />
            <col className="w-[62px]" />
            <col className="w-[62px]" />
            <col className="w-[62px]" />
            <col className="w-[62px]" />
            <col className="w-[62px]" />
          </colgroup>
        ) : null}
        <thead>
          <tr className="border-b border-[rgba(212,167,86,0.2)] bg-[linear-gradient(180deg,rgba(212,167,86,0.09),rgba(212,167,86,0.025))] text-[#d9bd89]">
            {showStats ? (
              <>
                <SortHeader label="크루" sortKey="crew_name" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
                <SortHeader label="이름" sortKey="nickname" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
                <SortHeader label="직업" sortKey="job" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
                <SortHeader label="말" sortKey="horse" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
                <SortHeader label="무기" sortKey="weapon" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
                <SortHeader label="두갑" sortKey="helmet" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
                <SortHeader label="흉갑" sortKey="armor" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
                <SortHeader label="각갑" sortKey="shoes" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
                <SortHeader label="무력" sortKey="stat_strength" activeKey={sortKey} direction={sortDirection} separated onSort={handleSort} />
                <SortHeader label="기민" sortKey="stat_agility" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
                <SortHeader label="기력" sortKey="stat_vitality" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
                <SortHeader label="지모" sortKey="stat_intelligence" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
              </>
            ) : (
              <>
                {["크루", "이름", "직업", "말", "무기", "두갑", "흉갑", "각갑"].map((label) => (
                  <th key={label} className="whitespace-nowrap px-1 py-3 text-center text-[11px] font-extrabold tracking-[0.02em]">
                    {label}
                  </th>
                ))}
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((member, rowIndex) => {
            const crewBadgeClass = crewBadgeClassMap[member.crew_name] ?? "bg-white/10 text-[#f3e7d0] ring-white/10";
            const hiddenJob = getHiddenJobBadge(member.job);
            const stripeClass = rowIndex % 2 === 0
              ? "bg-black/10"
              : "bg-[rgba(212,167,86,0.075)]";

            return (
              <Fragment key={`${member.nation}-${member.nickname}`}>
                <tr className={`equipment-member-row border-t border-[rgba(212,167,86,0.14)] text-[#f3e7d0] transition-colors ${stripeClass}`}>
                <td className="whitespace-nowrap px-1 py-3.5 text-center">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-extrabold tracking-[-0.02em] ring-1 ${crewBadgeClass}`}>
                    {member.crew_name}
                  </span>
                </td>
                <td className="whitespace-nowrap px-1 py-3.5 text-center text-[14px] font-black tracking-[-0.02em] text-[#fff4df]">{member.nickname}</td>
                <td className="whitespace-nowrap px-1 py-3 text-center font-medium">
                  {hiddenJob ? (
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-[12px] font-extrabold ring-1 ${hiddenJob.className}`}>
                      {hiddenJob.label === "군주" ? "👑" : hiddenJob.prefix ? <span className="mr-1 text-white">{hiddenJob.prefix}</span> : null}{formatJobDisplayName(member.job)}
                    </span>
                  ) : (
                    <span>{formatJobDisplayName(member.job)}</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-1 py-3 text-center font-medium">
                  <span className={`inline-flex min-w-[42px] justify-center rounded-full px-2 py-1 text-[12px] font-extrabold ring-1 ${getHorseBadgeClass(member.horse)}`}>
                    {formatHorseName(member.horse, member.horse_level)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-1 py-3 text-center"><EquipmentValue value={formatValue(member.weapon)} /></td>
                <td className="whitespace-nowrap px-1 py-3 text-center"><EquipmentValue value={formatHeadArmor(member.job, member.helmet)} /></td>
                <td className="whitespace-nowrap px-1 py-3 text-center"><EquipmentValue value={formatValue(member.armor)} /></td>
                <td className="whitespace-nowrap px-1 py-3 text-center"><EquipmentValue value={formatValue(member.shoes)} /></td>
                {showStats ? (
                  <>
                    <td className="whitespace-nowrap border-l-2 border-[rgba(212,167,86,0.24)] px-2 py-3 text-center"><EquipmentValue value={member.stat_strength} /></td>
                    <td className="whitespace-nowrap px-1 py-3 text-center"><EquipmentValue value={member.stat_agility} /></td>
                    <td className="whitespace-nowrap px-1 py-3 text-center"><EquipmentValue value={member.stat_vitality} /></td>
                    <td className="whitespace-nowrap px-1 py-3 text-center"><EquipmentValue value={member.stat_intelligence} /></td>
                  </>
                ) : null}
                </tr>
                {!showStats ? (
                  <tr className={`equipment-stat-row ${stripeClass} text-[#bba47c]`}>
                    <td colSpan={8} className="px-3 pb-3 pt-0">
                      <div className="mx-auto flex w-fit flex-wrap items-center justify-center gap-1.5 rounded-full border border-white/[0.055] bg-black/20 px-2 py-1 text-[11px] font-bold">
                        <span className="rounded-full px-2 py-0.5">무력 <b className="ml-1 font-black tabular-nums text-[#f6dfb2]">{member.stat_strength}</b></span>
                        <span className="rounded-full px-2 py-0.5">기민 <b className="ml-1 font-black tabular-nums text-[#f6dfb2]">{member.stat_agility}</b></span>
                        <span className="rounded-full px-2 py-0.5">기력 <b className="ml-1 font-black tabular-nums text-[#f6dfb2]">{member.stat_vitality}</b></span>
                        <span className="rounded-full px-2 py-0.5">지모 <b className="ml-1 font-black tabular-nums text-[#f6dfb2]">{member.stat_intelligence}</b></span>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}

          {Array.from({ length: emptySlotCount }, (_, index) => (
            <tr
              key={`empty-${index}`}
              className={`border-t border-[rgba(212,167,86,0.10)] text-[#7f7059] ${
                (sortedRows.length + index) % 2 === 0 ? "bg-black/10" : "bg-[rgba(212,167,86,0.075)]"
              }`}
            >
              <td className="whitespace-nowrap px-1 py-3 text-center">
                <span className="inline-flex items-center rounded-full bg-white/[0.03] px-1.5 py-1 text-[11px] font-bold text-[#8f8068] ring-1 ring-white/[0.08]">
                  미입력
                </span>
              </td>
              <td className="whitespace-nowrap px-1 py-3 text-center text-[14px] font-bold tracking-[-0.01em]">미입력</td>
              <td className="whitespace-nowrap px-1 py-3 text-center font-medium">-</td>
              <td className="whitespace-nowrap px-1 py-3 text-center font-medium">-</td>
              <td className="whitespace-nowrap px-1 py-3 text-center font-medium">-</td>
              <td className="whitespace-nowrap px-1 py-3 text-center font-medium">-</td>
              <td className="whitespace-nowrap px-1 py-3 text-center font-medium">-</td>
              <td className="whitespace-nowrap px-1 py-3 text-center font-medium">-</td>
              {showStats ? (
                <>
                  <td className="whitespace-nowrap border-l-2 border-[rgba(212,167,86,0.18)] px-2 py-3 text-center font-medium">-</td>
                  <td className="whitespace-nowrap px-1 py-3 text-center font-medium">-</td>
                  <td className="whitespace-nowrap px-1 py-3 text-center font-medium">-</td>
                  <td className="whitespace-nowrap px-1 py-3 text-center font-medium">-</td>
                </>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
