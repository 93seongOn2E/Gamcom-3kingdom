"use client";

import { adventureHiddenJobOptions, baseJobOptions, formatJobDisplayName, getHiddenJobBadge, hiddenJobOptionsByNation } from "@/lib/factions-config";
import { canEquipHeadArmor, horseEnhancementOptions, horseOptions } from "@/lib/equipment-config";
import { useEffect, useMemo, useState } from "react";

type MemberRow = {
  id: number;
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

type EditableMember = MemberRow & {
  horseInput: string;
  horseLevelInput: string;
  weaponInput: string;
  helmetInput: string;
  armorInput: string;
  shoesInput: string;
  statStrengthInput: string;
  statAgilityInput: string;
  statVitalityInput: string;
  statIntelligenceInput: string;
};

type NoticeState = {
  message: string;
  type: "success" | "error";
};

function toEditable(member: MemberRow): EditableMember {
  return {
    ...member,
    horseInput: member.horse ?? "",
    horseLevelInput: String(member.horse_level ?? 0),
    weaponInput: member.weapon == null ? "" : String(member.weapon),
    helmetInput: member.helmet == null ? "" : String(member.helmet),
    armorInput: member.armor == null ? "" : String(member.armor),
    shoesInput: member.shoes == null ? "" : String(member.shoes),
    statStrengthInput: String(member.stat_strength ?? 0),
    statAgilityInput: String(member.stat_agility ?? 0),
    statVitalityInput: String(member.stat_vitality ?? 0),
    statIntelligenceInput: String(member.stat_intelligence ?? 0)
  };
}

const nationOrder = ["위나라", "촉나라", "오나라"];

const nationTitleClassMap: Record<string, string> = {
  위나라: "text-[#6aa6ff]",
  촉나라: "text-[#5fd48c]",
  오나라: "text-[#f0c34a]"
};

const nationColorMap: Record<string, string> = {
  위나라: "#6aa6ff",
  촉나라: "#5fd48c",
  오나라: "#f0c34a"
};

const nationSaveButtonClassMap: Record<string, string> = {
  위나라: "admin-btn-save-wei",
  촉나라: "admin-btn-save-shu",
  오나라: "admin-btn-save-wu"
};

function hasSelectableJob(member: EditableMember) {
  if (!member.job) {
    return true;
  }

  return [
    ...baseJobOptions.map((option) => option.value),
    ...adventureHiddenJobOptions,
    ...(hiddenJobOptionsByNation[member.nation] ?? [])
  ].includes(member.job);
}

export function AdminFactionsEditor() {
  const [members, setMembers] = useState<EditableMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [activeNation, setActiveNation] = useState(nationOrder[0]);

  useEffect(() => {
    fetch("/api/admin/members", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("세력 정보를 불러오지 못했습니다.");
        }

        const data = (await response.json()) as { members: MemberRow[] };
        setMembers(data.members.map(toEditable));
      })
      .catch((error) => {
        setNotice({
          type: "error",
          message: error instanceof Error ? error.message : "세력 정보를 불러오지 못했습니다."
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const groupedMembers = useMemo(
    () =>
      nationOrder.map((nation) => ({
        nation,
        members: members.filter((member) => member.nation === nation)
      })),
    [members]
  );

  function updateField(id: number, field: keyof EditableMember, value: string) {
    setMembers((current) =>
      current.map((member) =>
        member.id === id
          ? {
              ...member,
              [field]: value
            }
          : member
      )
    );
  }

  async function saveMember(member: EditableMember) {
    setSavingId(member.id);

    try {
      const response = await fetch("/api/admin/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: member.id,
          job: member.job,
          horse: member.horseInput.trim() || null,
          horseLevel: member.horseInput ? Number(member.horseLevelInput) : 0,
          weapon: member.weaponInput === "" ? null : Number(member.weaponInput),
          helmet: canEquipHeadArmor(member.job) && member.helmetInput !== "" ? Number(member.helmetInput) : null,
          armor: member.armorInput === "" ? null : Number(member.armorInput),
          shoes: member.shoesInput === "" ? null : Number(member.shoesInput),
          statStrength: Number(member.statStrengthInput),
          statAgility: Number(member.statAgilityInput),
          statVitality: Number(member.statVitalityInput),
          statIntelligence: Number(member.statIntelligenceInput)
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(typeof data.message === "string" ? data.message : "세력 정보를 저장하지 못했습니다.");
      }

      const updated = data.member as MemberRow;
      setMembers((current) => current.map((item) => (item.id === updated.id ? toEditable(updated) : item)));
      setNotice({ type: "success", message: `${updated.nickname} 정보를 저장했습니다.` });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "세력 정보를 저장하지 못했습니다."
      });
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return <div className="pixel-frame p-5 text-sm text-[#dbc292]">세력 정보를 불러오는 중입니다...</div>;
  }

  return (
    <div className="font-['Noto_Sans_KR','Malgun_Gothic',sans-serif]">
      {notice ? (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/45 px-4 backdrop-blur-sm">
          <div className="pixel-frame w-full max-w-sm bg-[#101010] p-5 text-center shadow-[0_24px_60px_rgba(0,0,0,0.42)]">
            <div className={`mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full text-lg font-black ring-1 ${
              notice.type === "success"
                ? "bg-[#d4a017]/18 text-[#ffe0a3] ring-[#d4a756]/34"
                : "bg-[#7f1d1d]/28 text-[#fecaca] ring-[#ef4444]/34"
            }`}>
              {notice.type === "success" ? "✓" : "!"}
            </div>
            <p className="text-sm font-bold leading-6 text-[#f3e7d0]">{notice.message}</p>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="mt-4 rounded-lg border border-[rgba(212,167,86,0.34)] bg-[#d4a017]/16 px-5 py-2 text-sm font-black text-[#ffe0a3] transition hover:bg-[#d4a017]/24"
            >
              확인
            </button>
          </div>
        </div>
      ) : null}

      <div className="mb-4 grid grid-cols-3 gap-2" role="tablist" aria-label="국가별 장비현황">
        {nationOrder.map((nation) => {
          const active = activeNation === nation;
          const memberCount = groupedMembers.find((group) => group.nation === nation)?.members.length ?? 0;

          return (
            <button
              key={nation}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveNation(nation)}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-black transition-colors"
              style={{
                borderColor: active ? nationColorMap[nation] : "rgba(212, 167, 86, 0.2)",
                background: active ? `${nationColorMap[nation]}22` : "rgba(255, 255, 255, 0.025)",
                color: active ? nationColorMap[nation] : "#9f9078"
              }}
            >
              <span>{nation}</span>
              <span className="rounded-full bg-black/30 px-2 py-0.5 text-[11px]">{memberCount}</span>
            </button>
          );
        })}
      </div>

      {groupedMembers.filter((group) => group.nation === activeNation).map((group) => (
        <section key={group.nation} className="pixel-frame min-w-0 overflow-hidden">
          <div className="border-b border-[var(--border)] px-4 py-3">
            <h2 className={`text-lg font-black ${nationTitleClassMap[group.nation] ?? "text-[#f3e7d0]"}`}>{group.nation}</h2>
          </div>

          <div className="overflow-hidden">
            <table className="w-full table-fixed border-collapse text-[11px] leading-4">
              <thead>
                <tr className="bg-white/[0.03] text-[#dbc292]">
                  <th className="w-[42px] whitespace-nowrap px-0 py-2 text-center font-bold">이름</th>
                  <th className="w-[76px] whitespace-nowrap px-0.5 py-2 text-center font-bold">직업</th>
                  <th className="w-[56px] whitespace-nowrap px-0.5 py-2 text-center font-bold">말</th>
                  <th className="w-[50px] whitespace-nowrap px-0 py-2 text-center text-[10px] font-bold">강화(말)</th>
                  <th className="w-[28px] whitespace-nowrap px-0 py-2 text-center text-[10px] font-bold">무기</th>
                  <th className="w-[28px] whitespace-nowrap px-0 py-2 text-center text-[10px] font-bold">두갑</th>
                  <th className="w-[28px] whitespace-nowrap px-0 py-2 text-center text-[10px] font-bold">흉갑</th>
                  <th className="w-[28px] whitespace-nowrap px-0 py-2 text-center text-[10px] font-bold">각갑</th>
                  <th className="admin-equipment-stat-divider w-[16px] p-0" aria-hidden="true" />
                  <th className="w-[30px] whitespace-nowrap px-0 py-2 text-center text-[10px] font-bold">무력</th>
                  <th className="w-[30px] whitespace-nowrap px-0 py-2 text-center text-[10px] font-bold">기민</th>
                  <th className="w-[30px] whitespace-nowrap px-0 py-2 text-center text-[10px] font-bold">기력</th>
                  <th className="w-[30px] whitespace-nowrap px-0 py-2 text-center text-[10px] font-bold">지모</th>
                  <th className="w-[50px] whitespace-nowrap px-0.5 py-2 text-center font-bold">저장</th>
                </tr>
              </thead>
              <tbody>
                {group.members.map((member) => {
                  const selectedBadge = getHiddenJobBadge(member.job);

                  return (
                    <tr key={member.id} className="border-t border-[rgba(212,167,86,0.14)] text-[#f3e7d0]">
                      <td className="truncate px-0 py-2 text-center text-[12px] font-bold" title={member.nickname}>{member.nickname}</td>
                      <td className="px-0.5 py-2 text-center">
                        <div className="grid gap-1.5">
                          <select
                            value={member.job ?? ""}
                            onChange={(event) => updateField(member.id, "job", event.target.value)}
                            className="h-8 w-full min-w-0 rounded-md border border-[var(--border)] bg-black/60 px-1 text-[10px] font-bold text-[#f3e7d0] outline-none"
                          >
                            <option value="">미선택</option>
                            {!hasSelectableJob(member) && member.job ? (
                              <option value={member.job}>현재값 - {member.job}</option>
                            ) : null}
                            <optgroup label="일반 직업군">
                              {baseJobOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.group} - {option.value}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="모험/API 히든">
                              {adventureHiddenJobOptions.map((option) => (
                                <option key={option} value={option}>
                                  히든 - {option}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label={`${member.nation} 히든`}>
                              {(hiddenJobOptionsByNation[member.nation] ?? []).map((option) => (
                                <option key={option} value={option}>
                                  히든 - {option}
                                </option>
                              ))}
                            </optgroup>
                          </select>
                          {member.job ? (
                            <span className={`inline-flex max-w-full justify-center truncate rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ring-1 ${selectedBadge ? selectedBadge.className : "bg-white/5 text-[#dbc292] ring-white/10"}`}>
                              {selectedBadge?.label === "군주" ? "👑" : selectedBadge?.prefix ? <span className="mr-1 text-white">{selectedBadge.prefix}</span> : null}{formatJobDisplayName(member.job)}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-0.5 py-2">
                        <select
                          value={member.horseInput}
                          onChange={(event) => {
                            const horse = event.target.value;
                            updateField(member.id, "horseInput", horse);
                            if (!horse) updateField(member.id, "horseLevelInput", "0");
                          }}
                          className="h-8 w-full min-w-0 rounded-md border border-[var(--border)] bg-black/60 px-0.5 text-[10px] font-bold text-[#f3e7d0] outline-none"
                        >
                          <option value="">없음</option>
                          {member.horseInput && !horseOptions.includes(member.horseInput as (typeof horseOptions)[number]) ? (
                            <option value={member.horseInput}>현재값 - {member.horseInput}</option>
                          ) : null}
                          {horseOptions.map((horse) => (
                            <option key={horse} value={horse}>{horse}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-0.5 py-2">
                        <select
                          value={member.horseLevelInput}
                          onChange={(event) => updateField(member.id, "horseLevelInput", event.target.value)}
                          disabled={!member.horseInput}
                          className="h-8 w-full min-w-0 rounded-md border border-[var(--border)] bg-black/60 px-0 text-center text-[10px] font-bold text-[#f3e7d0] outline-none disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          {horseEnhancementOptions.map((level) => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-0.5 py-2">
                        <input
                          value={member.weaponInput}
                          onChange={(event) => updateField(member.id, "weaponInput", event.target.value)}
                          className="h-8 w-full min-w-0 rounded-md border border-[var(--border)] bg-black/40 px-0 text-center text-[10px] text-[#f3e7d0] outline-none"
                          inputMode="numeric"
                        />
                      </td>
                      <td className="px-0.5 py-2">
                        {canEquipHeadArmor(member.job) ? (
                          <input
                            value={member.helmetInput}
                            onChange={(event) => updateField(member.id, "helmetInput", event.target.value)}
                            className="h-8 w-full min-w-0 rounded-md border border-[var(--border)] bg-black/40 px-0 text-center text-[10px] text-[#f3e7d0] outline-none"
                            inputMode="numeric"
                          />
                        ) : (
                          <span className="block text-center text-[12px] font-bold text-[#756b5a]">-</span>
                        )}
                      </td>
                      <td className="px-0.5 py-2">
                        <input
                          value={member.armorInput}
                          onChange={(event) => updateField(member.id, "armorInput", event.target.value)}
                          className="h-8 w-full min-w-0 rounded-md border border-[var(--border)] bg-black/40 px-0 text-center text-[10px] text-[#f3e7d0] outline-none"
                          inputMode="numeric"
                        />
                      </td>
                      <td className="px-0.5 py-2">
                        <input
                          value={member.shoesInput}
                          onChange={(event) => updateField(member.id, "shoesInput", event.target.value)}
                          className="h-8 w-full min-w-0 rounded-md border border-[var(--border)] bg-black/40 px-0 text-center text-[10px] text-[#f3e7d0] outline-none"
                          inputMode="numeric"
                        />
                      </td>
                      <td className="admin-equipment-stat-divider w-[16px] p-0" aria-hidden="true" />
                      <td className="px-0.5 py-2">
                        <input
                          value={member.statStrengthInput}
                          onChange={(event) => updateField(member.id, "statStrengthInput", event.target.value)}
                          className="h-8 w-full min-w-0 rounded-md border border-[var(--border)] bg-black/40 px-0 text-center text-[10px] text-[#f3e7d0] outline-none"
                          inputMode="numeric"
                        />
                      </td>
                      <td className="px-0.5 py-2">
                        <input
                          value={member.statAgilityInput}
                          onChange={(event) => updateField(member.id, "statAgilityInput", event.target.value)}
                          className="h-8 w-full min-w-0 rounded-md border border-[var(--border)] bg-black/40 px-0 text-center text-[10px] text-[#f3e7d0] outline-none"
                          inputMode="numeric"
                        />
                      </td>
                      <td className="px-0.5 py-2">
                        <input
                          value={member.statVitalityInput}
                          onChange={(event) => updateField(member.id, "statVitalityInput", event.target.value)}
                          className="h-8 w-full min-w-0 rounded-md border border-[var(--border)] bg-black/40 px-0 text-center text-[10px] text-[#f3e7d0] outline-none"
                          inputMode="numeric"
                        />
                      </td>
                      <td className="px-0.5 py-2">
                        <input
                          value={member.statIntelligenceInput}
                          onChange={(event) => updateField(member.id, "statIntelligenceInput", event.target.value)}
                          className="h-8 w-full min-w-0 rounded-md border border-[var(--border)] bg-black/40 px-0 text-center text-[10px] text-[#f3e7d0] outline-none"
                          inputMode="numeric"
                        />
                      </td>
                      <td className="px-0.5 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => saveMember(member)}
                          disabled={savingId === member.id}
                          className={`${nationSaveButtonClassMap[group.nation] ?? "admin-btn-save"} mx-auto inline-flex min-w-[50px] rounded-md px-1 py-1 text-[10px]`}
                        >
                          {savingId === member.id ? "중..." : "저장"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
