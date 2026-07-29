import { MapViewer } from "@/components/MapViewer";
import { getCachedCastleData } from "@/lib/public-data";

export const revalidate = 15;

export default async function SimulationPage() {
  const castleData = await getCachedCastleData();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6">
        <p className="mb-2 text-xs font-black tracking-[0.18em] text-[#d4a756]">개인 연습 공간</p>
        <h1 className="text-3xl font-black tracking-[-0.04em] text-[#f3e7d0]">점령 시뮬레이터</h1>
        <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-[#aa9a82]">
          국가를 선택하고 영지를 눌러 자유롭게 점령 상황을 구성해 보세요. 변경 내용은 현재 브라우저 세션에만 저장되며 실제 지도와 다른 사용자에게는 반영되지 않습니다.
        </p>
      </div>

      <MapViewer initialData={castleData} simulation />
    </div>
  );
}
