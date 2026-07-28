import { NationEquipmentSelector } from "@/components/NationEquipmentSelector";

export default function NationEquipmentSelectionPage() {
  return (
    <div className="mx-auto max-w-[92rem] px-3 py-10 font-['Noto_Sans_KR','Malgun_Gothic',sans-serif]">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#f3e7d0]">국가별 장비현황</h1>
        <p className="mt-2 text-sm font-medium leading-6 text-[#aa9a82]">
          장비 정보는 관리자가 방송·제보 내용을 확인한 뒤 입력하므로 실제 실시간 정보와 다를 수 있습니다.
        </p>
      </div>
      <NationEquipmentSelector />
    </div>
  );
}
