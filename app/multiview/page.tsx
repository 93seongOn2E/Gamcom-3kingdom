import { getSql } from "@/lib/db";
import { MultiViewBuilder, type MultiViewMemberRow } from "@/components/MultiViewBuilder";

export default async function MultiViewPage() {
  const sql = getSql();
  const members = await sql.query(`
    SELECT
      id,
      nation,
      crew_name,
      nickname,
      soop_id,
      profile_image_url,
      is_live,
      viewer_count
    FROM public.member
    WHERE soop_id IS NOT NULL
      AND soop_id <> ''
    ORDER BY
      is_live DESC,
      nickname ASC
  `) as MultiViewMemberRow[];

  members.sort((left, right) => {
    if (left.is_live !== right.is_live) {
      return left.is_live ? -1 : 1;
    }

    return left.nickname.localeCompare(right.nickname, "ko");
  });

  return (
    <div className="mx-auto max-w-7xl px-4 pb-36 pt-10 font-['Noto_Sans_KR','Malgun_Gothic',sans-serif]">
      <MultiViewBuilder initialMembers={members} />
    </div>
  );
}
