import { ConquestGame } from "@/components/ConquestGame";

export const dynamic = "force-static";

export default function ConquestGamePage() {
  return (
    <div className="mx-auto max-w-[1500px] px-4 py-10">
      <div className="mb-6">
        <p className="mb-2 text-xs font-black tracking-[0.18em] text-[#d4a756]">AI 영토 확장 게임</p>
        <h1 className="text-3xl font-black tracking-[-0.04em] text-[#f3e7d0]">점령 시뮬게임</h1>
        <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-[#aa9a82]">
          1천만 금화를 활용해 영토를 확장하세요. 실제 지도 및 다른 사용자에게는 반영되지 않습니다.
        </p>
      </div>

      <ConquestGame />
    </div>
  );
}
