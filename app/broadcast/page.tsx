import { BroadcastDirectory, type MemberBroadcastRow } from "@/components/BroadcastDirectory";
import { getSoopLiveSnapshot } from "@/lib/soop-live-cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BroadcastPage() {
  const snapshot = await getSoopLiveSnapshot();
  const members = snapshot.members
    .map((member) => ({
      id: String(member.memberId),
      nation: member.nation,
      crew_name: member.crewName,
      nickname: member.nickname,
      soop_id: member.soopId,
      is_live: member.isLive,
      thumbnail_image_url: member.thumbnailImageUrl,
      broadcast_title: member.broadcastTitle,
      viewer_count: member.viewerCount,
      job: member.job
    }) satisfies MemberBroadcastRow)
    .sort((left, right) => {
      if (left.is_live !== right.is_live) return left.is_live ? -1 : 1;
      if ((left.viewer_count ?? 0) !== (right.viewer_count ?? 0)) {
        return (right.viewer_count ?? 0) - (left.viewer_count ?? 0);
      }

      return left.nickname.localeCompare(right.nickname, "ko");
    });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 font-['Noto_Sans_KR','Malgun_Gothic',sans-serif]">
      <BroadcastDirectory initialMembers={members} />
    </div>
  );
}
