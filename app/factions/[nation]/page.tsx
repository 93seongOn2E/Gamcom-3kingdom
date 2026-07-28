import { notFound } from "next/navigation";
import { EquipmentNation, FactionsEquipmentPage } from "@/components/FactionsEquipmentPage";

export const revalidate = 15;

const nationSlugMap = {
  위: "위나라",
  촉: "촉나라",
  오: "오나라"
} as const satisfies Record<string, EquipmentNation>;

export function generateStaticParams() {
  return Object.keys(nationSlugMap).map((nation) => ({ nation }));
}

export default async function NationFactionsPage({ params }: { params: Promise<{ nation: string }> }) {
  const { nation } = await params;
  let decodedNation = nation;

  try {
    decodedNation = decodeURIComponent(nation);
  } catch {
    notFound();
  }

  const selectedNation = nationSlugMap[decodedNation as keyof typeof nationSlugMap];

  if (!selectedNation) {
    notFound();
  }

  return <FactionsEquipmentPage selectedNation={selectedNation} />;
}
