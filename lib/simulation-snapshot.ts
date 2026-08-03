import type { CastleDataPayload, CastlePayload, ForceIdShort } from "@/lib/public-data";
import { territoryTiles } from "@/lib/territory-map-config";

/**
 * 점령 시뮬레이터 전용 공개 스냅샷.
 *
 * 2026-07-29 공개 지도 상태를 기준으로 고정했으며 DB와 연결되지 않습니다.
 * 시뮬레이터의 시작값과 초기화는 항상 이 데이터만 사용합니다.
 */
const claimedTerritories: Partial<Record<number, ForceIdShort>> = {
  8: "위",
  42: "촉",
  47: "오"
};

const snapshotCastles = territoryTiles.map((tile): CastlePayload => {
  const owner = claimedTerritories[tile.number] ?? "미점령";
  const isOccupied = owner !== "미점령";

  return {
    castleKey: `simulation-${String(tile.number).padStart(3, "0")}`,
    name: String(tile.number),
    level: 3,
    owner,
    isCapital: isOccupied,
    isCheonrimun: false,
    facilityType: isOccupied ? "장원" : "없음"
  };
});

export const simulationCastleSnapshot: CastleDataPayload = {
  forces: {
    위: snapshotCastles.slice(0, 20),
    촉: snapshotCastles.slice(20, 40),
    오: snapshotCastles.slice(40)
  }
};
