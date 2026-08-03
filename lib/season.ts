export type ThreeKingdomSeason = 1 | 2;

export function parseSeason(value: string | string[] | undefined): ThreeKingdomSeason {
  return value === "1" || (Array.isArray(value) && value[0] === "1") ? 1 : 2;
}
