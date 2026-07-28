export type TerritoryOwnerShort = "위" | "촉" | "오" | "미점령";
export type TerritoryOwnerFull = "위나라" | "촉나라" | "오나라" | "미점령";
export type TerritoryFacility = "없음" | "병영" | "성채" | "장원";

export const territoryFacilityOptions: TerritoryFacility[] = ["없음", "병영", "성채", "장원"];
export const territoryFacilityIcons: Record<TerritoryFacility, string> = {
  없음: "",
  병영: "⚔️",
  성채: "🛡️",
  장원: "🏠"
};
export const specialTerritoryNumbers = new Set([27]);

export const territoryTileSize = 50;
export const territoryTileStep = 54;
const territoryOriginX = 310;
const territoryOriginY = 115;

const numberedGridPositions: Array<[number, number, number]> = [
  [1, 0, 6], [2, 0, 7],
  [3, 1, 2], [4, 1, 3], [5, 1, 4], [6, 1, 5], [7, 1, 6], [8, 1, 7], [9, 1, 8], [10, 1, 9],
  [11, 2, 2], [12, 2, 3], [13, 2, 5], [14, 2, 6], [15, 2, 7], [16, 2, 8],
  [17, 3, 3], [18, 3, 4], [19, 3, 5], [20, 3, 6], [21, 3, 8], [22, 3, 9], [23, 3, 10],
  [24, 4, 2], [25, 4, 3], [26, 4, 4], [27, 4, 5], [28, 4, 6], [29, 4, 7], [30, 4, 9], [31, 4, 10],
  [32, 5, 1], [33, 5, 2], [34, 5, 4], [35, 5, 5], [36, 5, 6], [37, 5, 7], [38, 5, 8], [39, 5, 9],
  [40, 6, 0], [41, 6, 1], [42, 6, 2], [43, 6, 3], [44, 6, 4], [45, 6, 5], [46, 6, 7], [47, 6, 8], [48, 6, 9],
  [49, 7, 1], [50, 7, 2], [51, 7, 3], [52, 7, 4], [53, 7, 6], [54, 7, 7], [55, 7, 8], [56, 7, 9],
  [57, 8, 4], [58, 8, 5], [59, 8, 6], [60, 8, 7]
];

const blockedGridPositions: Array<[number, number]> = [
  [2, 4],
  [3, 7],
  [4, 8],
  [5, 3],
  [6, 6],
  [7, 5]
];

function toMapPosition(row: number, column: number) {
  return {
    cx: territoryOriginX + column * territoryTileStep,
    cy: territoryOriginY + row * territoryTileStep
  };
}

export const territoryTiles = numberedGridPositions.map(([number, row, column]) => ({
  number,
  row,
  column,
  ...toMapPosition(row, column)
}));

export const blockedTerritoryTiles = blockedGridPositions.map(([row, column], index) => ({
  id: `blocked-${index + 1}`,
  row,
  column,
  ...toMapPosition(row, column)
}));

export function getTerritoryTilePosition(number: number) {
  return territoryTiles.find((tile) => tile.number === number);
}
