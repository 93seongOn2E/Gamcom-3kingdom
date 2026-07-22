import { getSql } from "@/lib/db";
import { crewBadgeClassMap, formatJobDisplayName, getHiddenJobBadge, hiddenJobConfig, hiddenJobNames, nationConfigs } from "@/lib/factions-config";

export const revalidate = 15;
const nationMemberSlotCount = 30;

type MemberRow = {
  nation: string;
  crew_name: string;
  nickname: string;
  job: string | null;
  weapon: number | null;
  helmet: number | null;
  armor: number | null;
  shoes: number | null;
};

function formatValue(value: number | null) {
  return value == null ? "-" : value;
}

export default async function FactionsPage() {
  const sql = getSql();
  const hiddenJobSqlList = hiddenJobNames.map((job) => `'${job.replaceAll("'", "''")}'`).join(", ");
  const members = await sql.query(`
    SELECT nation, crew_name, nickname, job, weapon, helmet, armor, shoes
    FROM public.member
    ORDER BY
      CASE nation
        WHEN '위나라' THEN 1
        WHEN '촉나라' THEN 2
        WHEN '오나라' THEN 3
        ELSE 9
      END,
      CASE
        WHEN role_name = '군주' THEN 1
        WHEN job IN (${hiddenJobSqlList}) THEN 2
        ELSE 3
      END,
      weapon DESC NULLS LAST,
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
  `) as MemberRow[];

  const membersByNation = Object.fromEntries(
    nationConfigs.map((nation) => [
      nation.key,
      members.filter((member) => member.nation === nation.key)
    ])
  ) as Record<(typeof nationConfigs)[number]["key"], MemberRow[]>;

  return (
    <div className="mx-auto max-w-[92rem] px-3 py-10 font-['Noto_Sans_KR','Malgun_Gothic',sans-serif]">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#f3e7d0]">장비현황</h1>
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
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 ring-1 ${hiddenJobConfig["히든 패왕+창수"].badgeClass}`}>
              <span className="mr-1 text-white">✦</span>히든 패왕+창수
            </span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 ring-1 ${hiddenJobConfig["히든 책사"].badgeClass}`}>
              <span className="mr-1 text-white">✦</span>히든 책사
            </span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 ring-1 ${hiddenJobConfig.영객.badgeClass}`}>
              영객
            </span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 ring-1 ${hiddenJobConfig.패왕.badgeClass}`}>
              패왕
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

      <div className="grid gap-6 xl:grid-cols-3">
        {nationConfigs.map((nation) => {
          const rows = membersByNation[nation.key] ?? [];
          const emptySlotCount = Math.max(0, nationMemberSlotCount - rows.length);

          return (
            <section key={nation.key} className="pixel-frame overflow-hidden">
              <div className="border-b border-[var(--border)] px-5 py-5">
                <div className="mb-3 h-2 w-16" style={{ background: nation.color }} />
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-[#f3e7d0]">{nation.short}나라</h2>
                  <span className="rounded-full border border-[rgba(212,167,86,0.24)] bg-black/30 px-3 py-1 text-xs font-black text-[#dbc292]">
                    {Math.min(rows.length, nationMemberSlotCount)} / {nationMemberSlotCount}
                  </span>
                </div>
                <p className="text-sm font-medium leading-6 text-[#aa9a82]">{nation.description}</p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse text-[13px] leading-5">
                  <thead>
                    <tr className="bg-white/[0.03] text-[#dbc292]">
                      <th className="w-[76px] whitespace-nowrap px-1 py-3 text-center text-[13px] font-extrabold tracking-[-0.01em]">크루</th>
                      <th className="whitespace-nowrap px-1 py-3 text-center text-[13px] font-extrabold tracking-[-0.01em]">이름</th>
                      <th className="whitespace-nowrap px-1 py-3 text-center text-[13px] font-extrabold tracking-[-0.01em]">직업</th>
                      <th className="w-[42px] whitespace-nowrap px-1 py-3 text-center text-[12px] font-extrabold tracking-[-0.01em]">무기</th>
                      <th className="w-[42px] whitespace-nowrap px-1 py-3 text-center text-[12px] font-extrabold tracking-[-0.01em]">투구</th>
                      <th className="w-[42px] whitespace-nowrap px-1 py-3 text-center text-[12px] font-extrabold tracking-[-0.01em]">갑옷</th>
                      <th className="w-[42px] whitespace-nowrap px-1 py-3 text-center text-[12px] font-extrabold tracking-[-0.01em]">신발</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((member) => {
                      const crewBadgeClass = crewBadgeClassMap[member.crew_name] ?? "bg-white/10 text-[#f3e7d0] ring-white/10";
                      const hiddenJob = getHiddenJobBadge(member.job);

                      return (
                        <tr key={`${member.nation}-${member.nickname}`} className="border-t border-[rgba(212,167,86,0.14)] text-[#f3e7d0]">
                          <td className="whitespace-nowrap px-1 py-3 text-center">
                            <span className={`inline-flex items-center rounded-full px-1.5 py-1 text-[11px] font-bold ring-1 ${crewBadgeClass}`}>
                              {member.crew_name}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-1 py-3 text-center text-[14px] font-bold tracking-[-0.01em]">{member.nickname}</td>
                          <td className="whitespace-nowrap px-1 py-3 text-center font-medium">
                            {hiddenJob ? (
                              <span className={`inline-flex items-center rounded-full px-2 py-1 text-[12px] font-extrabold ring-1 ${hiddenJob.className}`}>
                                {hiddenJob.label === "군주" ? "👑" : hiddenJob.prefix ? <span className="mr-1 text-white">{hiddenJob.prefix}</span> : null}{formatJobDisplayName(member.job)}
                              </span>
                            ) : (
                              <span>{formatJobDisplayName(member.job)}</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-1 py-3 text-center font-medium text-[#cdb487]">{formatValue(member.weapon)}</td>
                          <td className="whitespace-nowrap px-1 py-3 text-center font-medium text-[#cdb487]">{formatValue(member.helmet)}</td>
                          <td className="whitespace-nowrap px-1 py-3 text-center font-medium text-[#cdb487]">{formatValue(member.armor)}</td>
                          <td className="whitespace-nowrap px-1 py-3 text-center font-medium text-[#cdb487]">{formatValue(member.shoes)}</td>
                        </tr>
                      );
                    })}

                    {Array.from({ length: emptySlotCount }, (_, index) => (
                      <tr key={`${nation.key}-empty-${index}`} className="border-t border-[rgba(212,167,86,0.10)] text-[#7f7059]">
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
