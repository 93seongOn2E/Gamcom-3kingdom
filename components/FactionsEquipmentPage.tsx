import { getSql } from "@/lib/db";
import { hiddenJobConfig, hiddenJobNames, nationConfigs } from "@/lib/factions-config";
import { NationEquipmentTable, type EquipmentMemberRow } from "@/components/NationEquipmentTable";
import Link from "next/link";

const nationMemberSlotCount = 30;
export type EquipmentNation = (typeof nationConfigs)[number]["key"];

function getEquipmentAverage(values: Array<number | null>) {
  const enteredValues = values.filter((value): value is number => value != null);
  if (enteredValues.length === 0) return null;

  return enteredValues.reduce((sum, value) => sum + value, 0) / enteredValues.length;
}

function formatEquipmentAverage(value: number | null) {
  return value == null ? "-" : value.toFixed(1);
}

export async function FactionsEquipmentPage({ selectedNation }: { selectedNation?: EquipmentNation }) {
  const sql = getSql();
  const hiddenJobSqlList = hiddenJobNames.map((job) => `'${job.replaceAll("'", "''")}'`).join(", ");
  const members = await sql.query(`
    SELECT nation, crew_name, nickname, job, horse, horse_level, weapon, helmet, armor, shoes,
           stat_strength, stat_agility, stat_vitality, stat_intelligence
    FROM public.member
    ${selectedNation ? "WHERE nation = $1" : ""}
    ORDER BY
      CASE nation
        WHEN '위나라' THEN 1
        WHEN '촉나라' THEN 2
        WHEN '오나라' THEN 3
        ELSE 9
      END,
      CASE
        WHEN role_name = '군주' THEN 1
        WHEN nickname IN ('박재박', '로기다', '꾸티뉴', '황원태', '홍타쿠') THEN 2
        WHEN job IN (${hiddenJobSqlList}) THEN 3
        ELSE 4
      END,
      (
        COALESCE(weapon, 0)
        + CASE WHEN job IN ('유비', '조조', '손권') THEN COALESCE(helmet, 0) ELSE 0 END
        + COALESCE(armor, 0)
        + COALESCE(shoes, 0)
      ) DESC,
      weapon DESC NULLS LAST,
      CASE WHEN job IN ('유비', '조조', '손권') THEN helmet ELSE NULL END DESC NULLS LAST,
      armor DESC NULLS LAST,
      shoes DESC NULLS LAST,
      CASE crew_name
        WHEN '버컴퍼니' THEN 1
        WHEN '버인협회' THEN 2
        WHEN '지력사무소' THEN 3
        WHEN '꾸한성' THEN 4
        WHEN '버블란' THEN 5
        WHEN '홍피스' THEN 6
        WHEN '로스타시티' THEN 7
        WHEN '원더독' THEN 8
        ELSE 99
      END,
      nickname
  `, selectedNation ? [selectedNation] : []) as EquipmentMemberRow[];

  const visibleNationConfigs = selectedNation
    ? nationConfigs.filter((nation) => nation.key === selectedNation)
    : nationConfigs;
  const membersByNation = Object.fromEntries(
    visibleNationConfigs.map((nation) => [
      nation.key,
      members.filter((member) => member.nation === nation.key)
    ])
  ) as Record<(typeof nationConfigs)[number]["key"], EquipmentMemberRow[]>;
  const selectedNationConfig = selectedNation
    ? nationConfigs.find((nation) => nation.key === selectedNation)
    : undefined;
  const nationAverages = visibleNationConfigs.map((nation) => {
    const nationMembers = membersByNation[nation.key] ?? [];
    return {
      ...nation,
      weapon: getEquipmentAverage(nationMembers.map((member) => member.weapon)),
      armor: getEquipmentAverage(nationMembers.map((member) => member.armor)),
      shoes: getEquipmentAverage(nationMembers.map((member) => member.shoes))
    };
  });

  return (
    <div className="mx-auto max-w-[102rem] px-3 py-10 font-['Noto_Sans_KR','Malgun_Gothic',sans-serif]">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: selectedNationConfig?.color ?? "#f3e7d0" }}>
            {selectedNationConfig ? `${selectedNationConfig.short}나라 내실현황` : "통합 내실현황"}
          </h1>
          <p className="mt-2 text-sm font-medium leading-6 text-[#aa9a82]">
            장비 정보는 관리자가 방송·제보 내용을 확인한 뒤 입력하므로 실제 실시간 정보와 다를 수 있습니다.
          </p>
        </div>

        <div className="pixel-frame px-4 py-3">
          <div className="mb-2 text-[12px] font-extrabold tracking-[-0.01em] text-[#dbc292]">직업뱃지</div>
          <div className="flex flex-wrap gap-2 text-[12px] font-bold">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 ring-1 ${hiddenJobConfig.군주.badgeClass}`}>
              👑군주
            </span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 ring-1 ${hiddenJobConfig["히든 영객"].badgeClass}`}>
              <span className="mr-1 text-white">✦</span>히든 영객
            </span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 ring-1 ${hiddenJobConfig["히든 패월"].badgeClass}`}>
              <span className="mr-1 text-white">✦</span>모험 히든 패월
            </span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 ring-1 ${hiddenJobConfig["히든 창수"].badgeClass}`}>
              <span className="mr-1 text-white">✦</span>히든 창수
            </span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 ring-1 ${hiddenJobConfig["히든 책사"].badgeClass}`}>
              <span className="mr-1 text-white">✦</span>히든 책사
            </span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 ring-1 ${hiddenJobConfig.영객.badgeClass}`}>
              영객
            </span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 ring-1 ${hiddenJobConfig.패월.badgeClass}`}>
              패월
            </span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 ring-1 ${hiddenJobConfig.창수.badgeClass}`}>
              창수
            </span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 ring-1 ${hiddenJobConfig.궁장.badgeClass}`}>
              궁장
            </span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 ring-1 ${hiddenJobConfig.책사.badgeClass}`}>
              책사
            </span>
          </div>
        </div>
      </div>

      <section className={`pixel-frame mb-5 p-4 md:p-5 ${selectedNation ? "mx-auto w-full max-w-[920px]" : "w-full"}`} aria-labelledby="nation-equipment-average-title">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="nation-equipment-average-title" className="text-lg font-black text-[#f3e7d0]">나라별 장비 평균</h2>
            <p className="mt-1 text-[12px] font-semibold text-[#8f8068]">무기·흉갑·각갑 기준 · 미입력 제외 · 0강 포함</p>
          </div>
        </div>

        <div className={`grid gap-2.5 ${selectedNation ? "grid-cols-1" : "sm:grid-cols-3"}`}>
          {nationAverages.map((nation) => (
              <article key={nation.key} className="rounded-xl border border-[rgba(212,167,86,0.16)] bg-black/25 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                <div className="mb-2.5 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: nation.color }} />
                  <span className="text-sm font-black" style={{ color: nation.color }}>
                    {nation.short}나라
                  </span>
                </div>
                <dl className="grid grid-cols-3 gap-1.5 text-center">
                  {([
                    ["무기", nation.weapon],
                    ["흉갑", nation.armor],
                    ["각갑", nation.shoes]
                  ] as const).map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-white/[0.055] bg-black/25 px-1 py-2">
                      <dt className="text-[10px] font-bold text-[#8f8068]">{label}</dt>
                      <dd className="mt-0.5 text-sm font-black tabular-nums text-[#ffe4ac]">{formatEquipmentAverage(value)}</dd>
                    </div>
                  ))}
                </dl>
              </article>
          ))}
        </div>
      </section>

      {selectedNation ? (
        <div className="mx-auto mb-5 flex w-full max-w-[920px] justify-start">
          <Link
            href="/factions/nation"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#f0c978] bg-[#d4a756] px-4 py-2.5 text-sm font-black text-[#181108] shadow-[0_4px_16px_rgba(212,167,86,0.22)] transition hover:bg-[#edc56f] hover:shadow-[0_5px_20px_rgba(212,167,86,0.32)]"
          >
            <span aria-hidden="true">←</span>
            국가 다시 선택
          </Link>
        </div>
      ) : null}

      <div className={selectedNation ? "mx-auto grid w-full max-w-[920px] gap-6" : "grid gap-4 xl:grid-cols-3"}>
        {visibleNationConfigs.map((nation) => {
          const rows = membersByNation[nation.key] ?? [];
          const emptySlotCount = Math.max(0, nationMemberSlotCount - rows.length);

          return (
            <section
              key={nation.key}
              className="nation-equipment-card pixel-frame overflow-hidden"
              style={{ "--nation-color": nation.color } as React.CSSProperties}
            >
              <div className="relative border-b border-[var(--border)] px-5 pb-4 pt-5">
                <div className="absolute inset-x-0 top-0 h-[3px] opacity-90" style={{ background: nation.color }} />
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-8 rounded-full" style={{ background: nation.color }} />
                      <span className="text-[10px] font-black tracking-[0.18em] text-[#8f8068]">내실 현황</span>
                    </div>
                    <h2 className="text-2xl font-black tracking-[-0.04em] text-[#f3e7d0]">{nation.short}나라</h2>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-baseline gap-1 rounded-full border border-[rgba(212,167,86,0.24)] bg-black/30 px-3 py-1 text-xs font-black text-[#dbc292] shadow-inner">
                      <strong className="text-sm text-[#fff1d3]">{Math.min(rows.length, nationMemberSlotCount)}</strong>
                      <span className="text-[#776a55]">/</span>
                      {nationMemberSlotCount}
                    </span>
                    <div className="mt-2 h-1 w-16 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (rows.length / nationMemberSlotCount) * 100)}%`,
                          background: nation.color
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <NationEquipmentTable rows={rows} emptySlotCount={emptySlotCount} showStats={Boolean(selectedNation)} />
            </section>
          );
        })}
      </div>
    </div>
  );
}
