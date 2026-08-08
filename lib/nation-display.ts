import type { ThreeKingdomSeason } from "@/lib/season";

export function getNationDisplayName(nation: string, season: ThreeKingdomSeason = 2) {
  if (season === 2 && nation === "오나라") return "꿈나라";
  return nation;
}

export function getSeasonNationText(content: string, season: ThreeKingdomSeason = 2) {
  return season === 2 ? content.replaceAll("오나라", "꿈나라") : content;
}
