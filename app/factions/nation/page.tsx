import { NationEquipmentSelector } from "@/components/NationEquipmentSelector";

export default function NationEquipmentSelectionPage() {
  return (
    <div className="mx-auto max-w-[92rem] px-3 py-10 font-['Noto_Sans_KR','Malgun_Gothic',sans-serif]">
      <div className="h-24" aria-hidden="true" />
      <NationEquipmentSelector />
    </div>
  );
}
