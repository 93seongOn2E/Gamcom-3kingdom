"use client";

import { baseJobOptions, formatJobDisplayName, getHiddenJobBadge, hiddenJobOptionsByNation } from "@/lib/factions-config";
import { useEffect, useMemo, useState } from "react";

type MemberRow = {
  id: number;
  nation: string;
  crew_name: string;
  nickname: string;
  job: string | null;
  weapon: number | null;
  helmet: number | null;
  armor: number | null;
  shoes: number | null;
};

type EditableMember = MemberRow & {
  weaponInput: string;
  helmetInput: string;
  armorInput: string;
  shoesInput: string;
};

type NoticeState = {
  message: string;
  type: "success" | "error";
};

function toEditable(member: MemberRow): EditableMember {
  return {
    ...member,
    weaponInput: member.weapon == null ? "" : String(member.weapon),
    helmetInput: member.helmet == null ? "" : String(member.helmet),
    armorInput: member.armor == null ? "" : String(member.armor),
    shoesInput: member.shoes == null ? "" : String(member.shoes)
  };
}

const nationOrder = ["위나라", "촉나라", "오나라"];

const nationTitleClassMap: Record<string, string> = {
  위나라: "text-[#6aa6ff]",
  촉나라: "text-[#5fd48c]",
  오나라: "text-[#ff6b5f]"
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
    ...(hiddenJobOptionsByNation[member.nation] ?? [])
  ].includes(member.job);
}

export function AdminFactionsEditor() {
  const [members, setMembers] = useState<EditableMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [notice, setNotice] = useState<NoticeState | null>(null);

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
          weapon: member.weaponInput === "" ? null : Number(member.weaponInput),
          helmet: member.helmetInput === "" ? null : Number(member.helmetInput),
          armor: member.armorInput === "" ? null : Number(member.armorInput),
          shoes: member.shoesInput === "" ? null : Number(member.shoesInput)
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
    <div className="grid gap-4 font-['Noto_Sans_KR','Malgun_Gothic',sans-serif] xl:grid-cols-3">
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

      {groupedMembers.map((group) => (
        <section key={group.nation} className="pixel-frame overflow-hidden">
          <div className="border-b border-[var(--border)] px-4 py-3">
            <h2 className={`text-lg font-black ${nationTitleClassMap[group.nation] ?? "text-[#f3e7d0]"}`}>{group.nation}</h2>
          </div>

          <div className="overflow-hidden">
            <table className="w-full table-auto border-collapse text-[12px] leading-4">
              <thead>
                <tr className="bg-white/[0.03] text-[#dbc292]">
                  <th className="whitespace-nowrap px-1 py-2 text-center font-bold">이름</th>
                  <th className="whitespace-nowrap px-1 py-2 text-center font-bold">무기</th>
                  <th className="w-[48px] whitespace-nowrap px-1 py-2 text-center text-[11px] font-bold">무기</th>
                  <th className="w-[48px] whitespace-nowrap px-1 py-2 text-center text-[11px] font-bold">투구</th>
                  <th className="w-[48px] whitespace-nowrap px-1 py-2 text-center text-[11px] font-bold">갑옷</th>
                  <th className="w-[48px] whitespace-nowrap px-1 py-2 text-center text-[11px] font-bold">신발</th>
                  <th className="whitespace-nowrap px-1 py-2 text-center font-bold">저장</th>
                </tr>
              </thead>
              <tbody>
                {group.members.map((member) => {
                  const selectedBadge = getHiddenJobBadge(member.job);

                  return (
                    <tr key={member.id} className="border-t border-[rgba(212,167,86,0.14)] text-[#f3e7d0]">
                      <td className="whitespace-nowrap px-1 py-2 text-center text-[13px] font-bold">{member.nickname}</td>
                      <td className="px-1 py-2 text-center">
                        <div className="grid min-w-[118px] gap-1.5">
                          <select
                            value={member.job ?? ""}
                            onChange={(event) => updateField(member.id, "job", event.target.value)}
                            className="h-8 rounded-md border border-[var(--border)] bg-black/60 px-2 text-[11px] font-bold text-[#f3e7d0] outline-none"
                          >
                            <option value="">미선택</option>
                            {!hasSelectableJob(member) && member.job ? (
                              <option value={member.job}>현재값 - {member.job}</option>
                            ) : null}
                            <optgroup label="일반 무기">
                              {baseJobOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.group} - {option.value}
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
                            <span className={`inline-flex justify-center rounded-full px-2 py-0.5 text-[10px] font-extrabold ring-1 ${selectedBadge ? selectedBadge.className : "bg-white/5 text-[#dbc292] ring-white/10"}`}>
                              {selectedBadge?.label === "군주" ? "👑" : selectedBadge?.prefix ? <span className="mr-1 text-white">{selectedBadge.prefix}</span> : null}{formatJobDisplayName(member.job)}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-1.5 py-2">
                        <input
                          value={member.weaponInput}
                          onChange={(event) => updateField(member.id, "weaponInput", event.target.value)}
                          className="h-8 w-[42px] rounded-md border border-[var(--border)] bg-black/40 px-1 text-[11px] text-[#f3e7d0] outline-none"
                          inputMode="numeric"
                        />
                      </td>
                      <td className="px-1.5 py-2">
                        <input
                          value={member.helmetInput}
                          onChange={(event) => updateField(member.id, "helmetInput", event.target.value)}
                          className="h-8 w-[42px] rounded-md border border-[var(--border)] bg-black/40 px-1 text-[11px] text-[#f3e7d0] outline-none"
                          inputMode="numeric"
                        />
                      </td>
                      <td className="px-1.5 py-2">
                        <input
                          value={member.armorInput}
                          onChange={(event) => updateField(member.id, "armorInput", event.target.value)}
                          className="h-8 w-[42px] rounded-md border border-[var(--border)] bg-black/40 px-1 text-[11px] text-[#f3e7d0] outline-none"
                          inputMode="numeric"
                        />
                      </td>
                      <td className="px-1.5 py-2">
                        <input
                          value={member.shoesInput}
                          onChange={(event) => updateField(member.id, "shoesInput", event.target.value)}
                          className="h-8 w-[42px] rounded-md border border-[var(--border)] bg-black/40 px-1 text-[11px] text-[#f3e7d0] outline-none"
                          inputMode="numeric"
                        />
                      </td>
                      <td className="px-1.5 py-2">
                        <button
                          type="button"
                          onClick={() => saveMember(member)}
                          disabled={savingId === member.id}
                          className={`${nationSaveButtonClassMap[group.nation] ?? "admin-btn-save"} min-w-0 rounded-md px-2 py-1.5 text-[11px]`}
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
