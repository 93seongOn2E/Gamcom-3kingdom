"use client";

import { useEffect, useMemo, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { ko } from "date-fns/locale/ko";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("ko", ko);

type ChronicleRow = {
  id: number;
  event_at: string;
  nation: string;
  content: string;
  is_deleted: boolean;
  approval_status: "pending" | "approved" | "rejected";
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  author_name: string;
  created_at: string;
};

type ChronicleForm = {
  eventAt: Date | null;
  nations: string[];
  content: string;
};

const nationOptions = ["위나라", "촉나라", "오나라"];

const nationBadgeClassMap: Record<string, string> = {
  위나라: "bg-[#3f6797] text-white",
  촉나라: "bg-[#3f8153] text-white",
  오나라: "bg-[#d4a017] text-[#1f1600]"
};

const approvalStatusLabelMap: Record<ChronicleRow["approval_status"], string> = {
  pending: "승인 대기",
  approved: "승인됨",
  rejected: "반려됨"
};

const approvalStatusClassMap: Record<ChronicleRow["approval_status"], string> = {
  pending: "bg-[#d4a756]/18 text-[#f7d79d] ring-[#d4a756]/38",
  approved: "bg-[#2f9b5f]/22 text-[#ddffea] ring-[#2f9b5f]/42",
  rejected: "bg-[#b43d2f]/24 text-[#ffe0dd] ring-[#b43d2f]/44"
};

const fixedCreateYear = "2026";
const fixedCreateMonth = "08";
const minChronicleDate = new Date(2026, 7, 1, 0, 0, 0);
const maxChronicleDate = new Date(2026, 7, 31, 23, 55, 0);

const emptyForm: ChronicleForm = {
  eventAt: null,
  nations: [],
  content: ""
};

function parseNations(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseChronicleDate(value: string) {
  const date = value.slice(0, 10);
  const time = value.slice(11, 16);
  const [year, month, day] = date.split("-").map(Number);
  const [hour = 0, minute = 0] = time.split(":").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day, hour, minute, 0);
}

function toChronicleForm(entry: ChronicleRow): ChronicleForm {
  return {
    eventAt: parseChronicleDate(entry.event_at),
    nations: parseNations(entry.nation),
    content: entry.content
  };
}

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

function buildDateString(form: ChronicleForm) {
  if (!form.eventAt) return "";
  return `${fixedCreateYear}-${fixedCreateMonth}-${padDatePart(form.eventAt.getDate())} ${padDatePart(form.eventAt.getHours())}:${padDatePart(form.eventAt.getMinutes())}`;
}

function sortEntriesAscending(entries: ChronicleRow[]) {
  const statusOrder: Record<ChronicleRow["approval_status"], number> = {
    pending: 1,
    approved: 2,
    rejected: 3
  };

  return [...entries].sort((left, right) => {
    const statusDiff = statusOrder[left.approval_status] - statusOrder[right.approval_status];
    if (statusDiff !== 0) return statusDiff;

    const timeDiff = new Date(left.event_at).getTime() - new Date(right.event_at).getTime();
    if (timeDiff !== 0) return timeDiff;
    return left.id - right.id;
  });
}

function DateSelectGroup({
  form,
  onChange
}: {
  form: ChronicleForm;
  onChange: (value: Date | null) => void;
}) {
  return (
    <div className="admin-datetime-picker">
      <DatePicker
        selected={form.eventAt}
        onChange={onChange}
        locale="ko"
        showTimeSelect
        timeIntervals={5}
        timeCaption="시간"
        minDate={minChronicleDate}
        maxDate={maxChronicleDate}
        minTime={minChronicleDate}
        maxTime={maxChronicleDate}
        dateFormat="yyyy년 MM월 dd일 HH:mm"
        placeholderText="2026년 08월 일시 선택"
        shouldCloseOnSelect={false}
        className="h-11 w-full rounded-lg border border-[var(--border)] bg-black/40 px-3 text-[#f3e7d0] outline-none"
        calendarClassName="admin-datepicker-calendar"
        popperClassName="admin-datepicker-popper"
        portalId="admin-datepicker-portal"
      />
    </div>
  );
}

export function AdminChronicleEditor({ role }: { role: "master" | "manager" | "sub_manager" }) {
  const [entries, setEntries] = useState<ChronicleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [createForm, setCreateForm] = useState<ChronicleForm>(emptyForm);
  const [editForms, setEditForms] = useState<Record<number, ChronicleForm>>({});

  useEffect(() => {
    fetch("/api/admin/chronicle", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("연대기 정보를 불러오지 못했습니다.");
        }

        const data = (await response.json()) as { entries: ChronicleRow[] };
        setEntries(data.entries);
        setEditForms(Object.fromEntries(data.entries.map((entry) => [entry.id, toChronicleForm(entry)])));
      })
      .catch((error) => {
        setStatus(error instanceof Error ? error.message : "연대기 정보를 불러오지 못했습니다.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const createSelectableNations = useMemo(
    () => nationOptions.filter((nation) => !createForm.nations.includes(nation)),
    [createForm.nations]
  );

  function updateCreateDate(value: Date | null) {
    setCreateForm((current) => ({ ...current, eventAt: value }));
  }

  function updateCreateContent(value: string) {
    setCreateForm((current) => ({ ...current, content: value }));
  }

  function updateEditDate(id: number, value: Date | null) {
    setEditForms((current) => ({
      ...current,
      [id]: {
        ...current[id],
        eventAt: value
      }
    }));
  }

  function updateEditContent(id: number, value: string) {
    setEditForms((current) => ({
      ...current,
      [id]: {
        ...current[id],
        content: value
      }
    }));
  }

  function addNationToCreate(nation: string) {
    if (!nation) return;
    setCreateForm((current) =>
      current.nations.includes(nation) ? current : { ...current, nations: [...current.nations, nation] }
    );
  }

  function removeNationFromCreate(nation: string) {
    setCreateForm((current) => ({
      ...current,
      nations: current.nations.filter((item) => item !== nation)
    }));
  }

  function addNationToEdit(id: number, nation: string) {
    if (!nation) return;

    setEditForms((current) => {
      const form = current[id];
      if (!form || form.nations.includes(nation)) {
        return current;
      }

      return {
        ...current,
        [id]: {
          ...form,
          nations: [...form.nations, nation]
        }
      };
    });
  }

  function removeNationFromEdit(id: number, nation: string) {
    setEditForms((current) => ({
      ...current,
      [id]: {
        ...current[id],
        nations: current[id].nations.filter((item) => item !== nation)
      }
    }));
  }

  async function createEntry() {
    setCreating(true);
    setStatus("");

    try {
      const response = await fetch("/api/admin/chronicle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventAt: buildDateString(createForm),
          nation: createForm.nations.join(", "),
          content: createForm.content
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(typeof data.message === "string" ? data.message : "연대기를 추가하지 못했습니다.");
      }

      const entry = data.entry as ChronicleRow;
      setEntries((current) => sortEntriesAscending([...current, entry]));
      setEditForms((current) => ({
        ...current,
        [entry.id]: toChronicleForm(entry)
      }));
      setCreateForm(emptyForm);
      setStatus(entry.approval_status === "approved" ? "연대기를 추가했습니다." : "연대기가 승인 대기로 등록되었습니다. 마스터 승인 후 메인 화면에 반영됩니다.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "연대기를 추가하지 못했습니다.");
    } finally {
      setCreating(false);
    }
  }

  async function updateEntry(id: number) {
    setEditingId(id);
    setStatus("");

    try {
      const form = editForms[id];
      const response = await fetch("/api/admin/chronicle", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          eventAt: buildDateString(form),
          nation: form.nations.join(", "),
          content: form.content
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(typeof data.message === "string" ? data.message : "연대기를 수정하지 못했습니다.");
      }

      const entry = data.entry as ChronicleRow;
      setEntries((current) => sortEntriesAscending(current.map((item) => (item.id === id ? entry : item))));
      setEditForms((current) => ({
        ...current,
        [id]: toChronicleForm(entry)
      }));
      setStatus("연대기를 수정했습니다.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "연대기를 수정하지 못했습니다.");
    } finally {
      setEditingId(null);
    }
  }

  async function deleteEntry(id: number) {
    setEditingId(id);
    setStatus("");

    try {
      const response = await fetch("/api/admin/chronicle", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(typeof data.message === "string" ? data.message : "연대기를 삭제하지 못했습니다.");
      }

      setEntries((current) => current.filter((item) => item.id !== id));
      setStatus("연대기를 삭제했습니다.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "연대기를 삭제하지 못했습니다.");
    } finally {
      setEditingId(null);
    }
  }

  async function reviewEntry(id: number, action: "approve" | "reject") {
    setEditingId(id);
    setStatus("");

    try {
      const response = await fetch("/api/admin/chronicle", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(typeof data.message === "string" ? data.message : "연대기 상태를 변경하지 못했습니다.");
      }

      const entry = data.entry as ChronicleRow;
      setEntries((current) => sortEntriesAscending(current.map((item) => (item.id === id ? entry : item))));
      setEditForms((current) => ({
        ...current,
        [id]: toChronicleForm(entry)
      }));
      setStatus(action === "approve" ? "연대기를 메인 화면에 반영했습니다." : "연대기를 반려했습니다.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "연대기 상태를 변경하지 못했습니다.");
    } finally {
      setEditingId(null);
    }
  }

  return (
    <div className="grid gap-5 font-['Noto_Sans_KR','Malgun_Gothic',sans-serif]">
      <div id="admin-datepicker-portal" />

      <section className="pixel-frame admin-chronicle-create-panel p-5">
        <h2 className="mb-5 text-lg font-black text-[#f3e7d0]">연대기 추가</h2>
        {role === "master" ? null : (
          <p className="mb-4 text-sm leading-6 text-[#dbc292]">
            일반 관리자가 추가한 연대기는 승인 대기로 등록되며, 마스터 승인 후 메인 화면에 반영됩니다.
          </p>
        )}

        <div className="grid gap-4 xl:grid-cols-[300px_240px_minmax(0,1fr)_140px]">
          <label className="grid gap-2">
            <span className="text-sm font-bold text-[#dbc292]">발생일</span>
            <DateSelectGroup form={createForm} onChange={updateCreateDate} />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-[#dbc292]">주요국</span>
            <select
              value=""
              onChange={(event) => {
                addNationToCreate(event.target.value);
                event.target.value = "";
              }}
              className="h-11 rounded-lg border border-[var(--border)] bg-black/40 px-3 text-[#f3e7d0] outline-none"
            >
              <option value="">{createSelectableNations.length ? "국가 선택" : "모든 국가 선택됨"}</option>
              {createSelectableNations.map((nation) => (
                <option key={nation} value={nation}>
                  {nation}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-[#dbc292]">내용</span>
            <input
              value={createForm.content}
              onChange={(event) => updateCreateContent(event.target.value)}
              placeholder="연대기 내용"
              className="h-11 rounded-lg border border-[var(--border)] bg-black/40 px-3 text-[#f3e7d0] outline-none"
            />
          </label>

          <div className="grid gap-2">
            <span className="select-none text-sm font-bold text-transparent">버튼</span>
            <button
              type="button"
              onClick={createEntry}
              disabled={creating}
              className="admin-btn-save h-11 w-full rounded-lg text-sm"
            >
              {creating ? "추가 중..." : "추가"}
            </button>
          </div>
        </div>

        <div className="mt-3 min-h-8">
          <div className="flex flex-wrap gap-2">
            {createForm.nations.map((nation) => (
              <button
                key={nation}
                type="button"
                onClick={() => removeNationFromCreate(nation)}
                className={`rounded-full px-3 py-1 text-xs font-bold ${nationBadgeClassMap[nation] ?? "bg-white/10 text-white"}`}
              >
                {nation}
              </button>
            ))}
          </div>
        </div>
      </section>

      {status ? <p className="pixel-frame p-4 text-sm text-[#f3e7d0]">{status}</p> : null}

      <section className="pixel-frame admin-chronicle-list-panel">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <h2 className="text-lg font-black text-[#f3e7d0]">연대기 목록</h2>
        </div>

        {loading ? (
          <div className="p-5 text-sm text-[#dbc292]">연대기 정보를 불러오는 중입니다...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-white/[0.03] text-left text-[#dbc292]">
                  <th className="px-3 py-3 font-bold">발생일</th>
                  <th className="px-3 py-3 font-bold">국가</th>
                  <th className="px-3 py-3 font-bold">내용</th>
                  <th className="px-3 py-3 font-bold">상태</th>
                  <th className="px-3 py-3 font-bold">작성자</th>
                  <th className="px-3 py-3 font-bold">작성일</th>
                  <th className="px-3 py-3 font-bold">검수</th>
                  <th className="px-3 py-3 font-bold">수정</th>
                  <th className="px-3 py-3 font-bold">삭제</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const form = editForms[entry.id];
                  const selectableNations = nationOptions.filter((nation) => !form?.nations.includes(nation));

                  return (
                    <tr key={entry.id} className="border-t border-[rgba(212,167,86,0.14)] align-top text-[#f3e7d0]">
                      <td className="px-3 py-3">
                        {form ? <DateSelectGroup form={form} onChange={(value) => updateEditDate(entry.id, value)} /> : null}
                      </td>
                      <td className="min-w-[260px] px-3 py-3">
                        <div className="grid gap-2">
                          <select
                            value=""
                            onChange={(event) => {
                              addNationToEdit(entry.id, event.target.value);
                              event.target.value = "";
                            }}
                            className="h-11 w-60 rounded-lg border border-[var(--border)] bg-black/40 px-3 text-[#f3e7d0] outline-none"
                          >
                            <option value="">{selectableNations.length ? "국가 선택" : "모든 국가 선택됨"}</option>
                            {selectableNations.map((nation) => (
                              <option key={nation} value={nation}>
                                {nation}
                              </option>
                            ))}
                          </select>

                          <div className="flex flex-nowrap gap-2">
                            {form?.nations.map((nation) => (
                              <button
                                key={nation}
                                type="button"
                                onClick={() => removeNationFromEdit(entry.id, nation)}
                                className={`rounded-full px-3 py-1 text-xs font-bold ${nationBadgeClassMap[nation] ?? "bg-white/10 text-white"}`}
                              >
                                {nation}
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <input
                          value={form?.content ?? ""}
                          onChange={(event) => updateEditContent(entry.id, event.target.value)}
                          className="h-11 min-w-[320px] rounded-lg border border-[var(--border)] bg-black/40 px-3 text-[#f3e7d0] outline-none"
                        />
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${approvalStatusClassMap[entry.approval_status]}`}>
                          {approvalStatusLabelMap[entry.approval_status]}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-[#cdb487]">{entry.author_name}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-[#cdb487]">{entry.created_at}</td>
                      <td className="min-w-[150px] px-3 py-3">
                        {role === "master" ? (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => reviewEntry(entry.id, "approve")}
                              disabled={editingId === entry.id || entry.approval_status === "approved"}
                              className="admin-btn-save rounded-lg text-sm"
                            >
                              승인
                            </button>
                            <button
                              type="button"
                              onClick={() => reviewEntry(entry.id, "reject")}
                              disabled={editingId === entry.id || entry.approval_status === "rejected"}
                              className="admin-btn-delete rounded-lg text-sm"
                            >
                              반려
                            </button>
                          </div>
                        ) : (
                          <div className="whitespace-nowrap text-sm leading-6 text-[#cdb487]">
                            {entry.reviewed_by_name ? `${entry.reviewed_by_name} 검수` : "대기 중"}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => updateEntry(entry.id)}
                          disabled={editingId === entry.id}
                          className="admin-btn-edit rounded-lg text-sm"
                        >
                          수정
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => deleteEntry(entry.id)}
                          disabled={editingId === entry.id || (role !== "master" && entry.approval_status === "approved")}
                          className="admin-btn-delete rounded-lg text-sm"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
