import { NationEquipmentSelector } from "@/components/NationEquipmentSelector";
import { parseSeason } from "@/lib/season";

export default async function NationEquipmentSelectionPage({ searchParams }: { searchParams: Promise<{ season?: string }> }) {
  const season = parseSeason((await searchParams).season);

  return (
    <div className="mx-auto max-w-[92rem] px-3 py-10 font-['Noto_Sans_KR','Malgun_Gothic',sans-serif]">
      <NationEquipmentSelector season={season} />
    </div>
  );
}
