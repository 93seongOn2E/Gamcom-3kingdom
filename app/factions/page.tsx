import { FactionsEquipmentPage } from "@/components/FactionsEquipmentPage";
import { parseSeason } from "@/lib/season";

export const revalidate = 15;

export default async function FactionsPage({ searchParams }: { searchParams: Promise<{ season?: string }> }) {
  const season = parseSeason((await searchParams).season);
  return <FactionsEquipmentPage season={season} />;
}
