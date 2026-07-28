"use client";

import { RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  blockedTerritoryTiles,
  getTerritoryTilePosition,
  specialTerritoryNumbers,
  territoryFacilityIcons,
  territoryFacilityOptions,
  type TerritoryFacility,
  type TerritoryOwnerFull
} from "@/lib/territory-map-config";

type ForceId = "위나라" | "촉나라" | "오나라";
type CastleLevel = 1 | 2 | 3;

type CastleSource = {
  castleKey: string;
  name: string;
  level: CastleLevel;
  owner: string;
  isCapital?: boolean;
  facilityType?: string;
  x?: number;
  y?: number;
};

type CastleData = {
  forces: Record<ForceId, CastleSource[]>;
};

type RawCastleData = {
  forces?: Record<string, CastleSource[] | undefined>;
};

type MapCastle = {
  id: string;
  name: string;
  number: number;
  owner: TerritoryOwnerFull;
  isCapital: boolean;
  facilityType: TerritoryFacility;
  cx: number;
  cy: number;
};

const forceIds: ForceId[] = ["위나라", "촉나라", "오나라"];
const viewerTerritoryTileSize = 53;
const viewerTerritoryScale = 1.18;
const viewerTerritoryOffsetY = 35;
const viewerTerritoryCenterX = 580;
const viewerTerritoryCenterY = 331;
const viewerTerritoryTransform = [
  `translate(0 ${viewerTerritoryOffsetY})`,
  `translate(${viewerTerritoryCenterX} ${viewerTerritoryCenterY})`,
  `scale(${viewerTerritoryScale})`,
  `translate(${-viewerTerritoryCenterX} ${-viewerTerritoryCenterY})`
].join(" ");

const emptyCastleData: CastleData = {
  forces: {
    위나라: [],
    촉나라: [],
    오나라: []
  }
};

const forceThemeClass: Record<TerritoryOwnerFull, "wei" | "shu" | "wu" | "unclaimed"> = {
  위나라: "wei",
  촉나라: "shu",
  오나라: "wu",
  미점령: "unclaimed"
};

const forceLabels: Record<ForceId, string> = {
  위나라: "위나라",
  촉나라: "촉나라",
  오나라: "오나라"
};

function normalizeOwner(force: string | undefined): TerritoryOwnerFull {
  if (force === "위나라" || force === "위") return "위나라";
  if (force === "촉나라" || force === "촉") return "촉나라";
  if (force === "오나라" || force === "오") return "오나라";
  return "미점령";
}

function normalizeFacility(facility: string | undefined): TerritoryFacility {
  return territoryFacilityOptions.includes(facility as TerritoryFacility)
    ? (facility as TerritoryFacility)
    : "없음";
}

function normalizeCastleSources(castles: CastleSource[] | undefined): CastleSource[] {
  return (castles ?? []).map((castle) => ({
    ...castle,
    owner: normalizeOwner(castle.owner),
    isCapital: Boolean(castle.isCapital),
    facilityType: normalizeFacility(castle.facilityType),
    x: Number.isFinite(castle.x) ? castle.x : undefined,
    y: Number.isFinite(castle.y) ? castle.y : undefined
  }));
}

function normalizeCastleData(data: RawCastleData): CastleData {
  const forces = data.forces ?? {};

  return {
    forces: {
      위나라: normalizeCastleSources(forces["위나라"] ?? forces["위"]),
      촉나라: normalizeCastleSources(forces["촉나라"] ?? forces["촉"]),
      오나라: normalizeCastleSources(forces["오나라"] ?? forces["오"])
    }
  };
}

function buildMapCastles(data: CastleData): MapCastle[] {
  return forceIds
    .flatMap((force) => data.forces[force])
    .map((source) => {
      const number = Number.parseInt(source.name, 10);
      const fallback = getTerritoryTilePosition(number);

      if (!Number.isInteger(number) || !fallback) {
        return null;
      }

      return {
        id: source.castleKey,
        name: String(number),
        number,
        owner: normalizeOwner(source.owner),
        isCapital: normalizeOwner(source.owner) === "미점령" ? false : Boolean(source.isCapital),
        facilityType: normalizeOwner(source.owner) === "미점령" ? "없음" : normalizeFacility(source.facilityType),
        cx: Number.isFinite(source.x) ? (source.x as number) : fallback.cx,
        cy: Number.isFinite(source.y) ? (source.y as number) : fallback.cy
      };
    })
    .filter((castle): castle is MapCastle => castle !== null)
    .sort((left, right) => left.number - right.number);
}

export function MapViewer({ compact = false, initialData }: { compact?: boolean; initialData?: RawCastleData }) {
  const initialCastleData = useMemo(() => initialData ? normalizeCastleData(initialData) : emptyCastleData, [initialData]);
  const [castleData, setCastleData] = useState<CastleData>(initialCastleData);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [isLoading, setIsLoading] = useState(!initialData);

  const loadCastles = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/castles?fresh=1", { cache: "no-store" });
      const data = await response.json() as RawCastleData;
      if (!response.ok) {
        throw new Error("지도 데이터를 불러오지 못했습니다.");
      }

      const normalized = normalizeCastleData(data);
      const allCastles = forceIds.flatMap((force) => normalized.forces[force]);
      setCastleData(normalized);
      setSelectedCityId((current) => allCastles.some((castle) => castle.castleKey === current) ? current : "");
    } catch {
      setCastleData(emptyCastleData);
      setSelectedCityId("");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialData) {
      void loadCastles();
    }
  }, [initialData, loadCastles]);

  const castles = useMemo(() => buildMapCastles(castleData), [castleData]);
  const summary = forceIds.reduce<Record<ForceId, number>>((acc, force) => {
    acc[force] = castles.filter((castle) => castle.owner === force).length;
    return acc;
  }, { 위나라: 0, 촉나라: 0, 오나라: 0 });

  const renderMapLayers = () => (
    <>
      <rect x="0" y="0" width="1180" height="720" fill="#d8bd8b" />
      <image className="admin-map-art" href="/assets/three-kingdoms-scroll-map.webp" x="0" y="0" width="1180" height="720" preserveAspectRatio="xMidYMid slice" />

      <g id="blocked-territories" aria-label="점령 불가 지역" transform={viewerTerritoryTransform}>
        {blockedTerritoryTiles.map((tile) => (
          <rect
            key={tile.id}
            className="admin-territory map-fixed-tile"
            data-owner="blocked"
            x={tile.cx - viewerTerritoryTileSize / 2}
            y={tile.cy - viewerTerritoryTileSize / 2}
            width={viewerTerritoryTileSize}
            height={viewerTerritoryTileSize}
          />
        ))}
      </g>

      <g id="territories" transform={viewerTerritoryTransform}>
        {castles.map((castle) => {
          const hasFacility = castle.facilityType !== "없음";
          const isSpecial = specialTerritoryNumbers.has(castle.number);
          const isUnclaimedSpecial = isSpecial && castle.owner === "미점령";
          const numberY = hasFacility ? castle.cy - 9 : castle.cy + 6;
          const facilityY = castle.cy + 14;

          return (
            <g key={castle.id}>
              <rect
                className={`admin-territory map-fixed-tile ${selectedCityId === castle.id ? "selected" : ""}`}
                data-owner={forceThemeClass[castle.owner]}
                data-special={isSpecial ? "buff" : undefined}
                data-city-id={castle.id}
                x={castle.cx - viewerTerritoryTileSize / 2}
                y={castle.cy - viewerTerritoryTileSize / 2}
                width={viewerTerritoryTileSize}
                height={viewerTerritoryTileSize}
                onClick={() => setSelectedCityId(castle.id)}
              />
              <text
                className={`map-territory-number ${hasFacility ? "has-facility" : ""} ${isUnclaimedSpecial ? "is-special-unclaimed" : ""}`}
                x={castle.cx}
                y={numberY}
              >
                {castle.isCapital ? <tspan className="map-territory-inline-crown">👑</tspan> : null}
                <tspan>{castle.name}</tspan>
              </text>
              {isSpecial ? (
                <text className="map-territory-special-star" x={castle.cx + 16} y={castle.cy - 13}>★</text>
              ) : null}
              {hasFacility ? (
                <g className="map-territory-detail" data-facility={castle.facilityType}>
                  <title>{castle.facilityType}</title>
                  <text className="map-territory-facility-icon" x={castle.cx} y={facilityY}>
                    {territoryFacilityIcons[castle.facilityType]}
                  </text>
                </g>
              ) : null}
            </g>
          );
        })}
      </g>
    </>
  );

  return (
    <section className={`map-viewer-shell pixel-frame overflow-hidden ${compact ? "compact p-3 md:p-4" : "p-4 md:p-6"}`}>
      <div className={`flex flex-col gap-3 md:mb-4 md:flex-row md:items-end md:justify-between ${compact ? "mb-3" : "mb-4"}`}>
        <div className="map-viewer-heading">
          <h2 className="text-2xl font-black text-[#f3e7d0]">삼국지 점령 지도</h2>
          <button
            type="button"
            onClick={() => void loadCastles()}
            disabled={isLoading}
            className="map-refresh-button"
            aria-label="점령 지도 새로고침"
            title="점령 지도 새로고침"
          >
            <RefreshCcw size={15} className={isLoading ? "animate-spin" : ""} />
            <span>새로고침</span>
          </button>
          <div className="map-territory-legend" aria-label="수도 및 거점 아이콘 설명">
            <span><b>👑</b> 수도</span>
            <span><b>⚔️</b> 병영</span>
            <span><b>🛡️</b> 성채</span>
            <span><b>🏠</b> 장원</span>
            <span><b>⭐</b> 버프</span>
          </div>
        </div>

        <div className="admin-top-summary" aria-label="세력별 보유 지역 수">
          {forceIds.map((force) => (
            <div key={force} className={`admin-top-summary-card ${forceThemeClass[force]}`}>
              <span>{forceLabels[force]}</span>
              <b>{summary[force]}</b>
            </div>
          ))}
        </div>
      </div>

      <div className={`admin-map-wrap ${compact ? "compact" : ""}`}>
        <svg id="map-viewer" className="map-svg-desktop" viewBox="0 0 1180 720" preserveAspectRatio="none" role="img" aria-label="60개 지역으로 구성된 삼국지 지도">
          {renderMapLayers()}
        </svg>
        <svg className="map-svg-mobile" viewBox="250 65 700 550" preserveAspectRatio="none" role="img" aria-label="60개 지역으로 구성된 모바일 삼국지 지도">
          {renderMapLayers()}
        </svg>

        {isLoading ? (
          <div className="map-loading-overlay" aria-live="polite" aria-busy="true">
            <div className="map-loading-swords" aria-hidden="true">
              <img
                src="/assets/loading-spear-2.png"
                alt=""
                className="map-loading-weapon map-loading-weapon-left"
              />
              <div className="map-loading-spark" />
              <img
                src="/assets/loading-spear-1.png"
                alt=""
                className="map-loading-weapon map-loading-weapon-right"
              />
            </div>
            <div className="map-loading-text">지도를 불러오는 중입니다.</div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
