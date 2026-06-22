"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCcw } from "lucide-react";

type ForceId = "위나라" | "촉나라" | "오나라";
type CastleLevel = 1 | 2 | 3;

type CastleSource = {
  castleKey: string;
  name: string;
  level: CastleLevel;
  owner: string;
  x?: number;
  y?: number;
};

type CastleData = {
  forces: Record<ForceId, CastleSource[]>;
};

type RawCastleData = {
  forces?: Record<string, CastleSource[] | undefined>;
};

type Tile = {
  x: number;
  y: number;
  cx: number;
  cy: number;
  size: number;
};

type Castle = {
  id: string;
  name: string;
  level: CastleLevel;
  origin: ForceId;
  owner: ForceId;
  cx: number;
  cy: number;
  territoryCx: number;
  territoryCy: number;
  cells: Tile[];
};

const forceIds: ForceId[] = ["위나라", "촉나라", "오나라"];

const emptyCastleData: CastleData = {
  forces: {
    위나라: [],
    촉나라: [],
    오나라: []
  }
};

const forceThemeClass: Record<ForceId, "wei" | "shu" | "wu"> = {
  위나라: "wei",
  촉나라: "shu",
  오나라: "wu"
};

const forceLayouts: Record<ForceId, { label: string; polygon: number[][]; markerSeeds: number[][] }> = {
  위나라: {
    label: "위나라",
    polygon: [[318, 132], [422, 86], [584, 88], [736, 116], [842, 168], [818, 270], [704, 352], [520, 362], [374, 306], [286, 234]],
    markerSeeds: [[370, 162], [494, 154], [618, 156], [742, 182], [432, 226], [565, 220], [690, 244], [540, 292], [761, 270]]
  },
  촉나라: {
    label: "촉나라",
    polygon: [[176, 330], [334, 302], [494, 322], [606, 374], [604, 476], [520, 588], [352, 616], [196, 562], [144, 436]],
    markerSeeds: [[240, 354], [362, 326], [490, 346], [560, 408], [250, 456], [386, 444], [510, 488], [314, 548], [452, 560]]
  },
  오나라: {
    label: "오나라",
    polygon: [[606, 304], [760, 278], [900, 304], [1030, 372], [1042, 512], [946, 604], [786, 624], [638, 556], [570, 420]],
    markerSeeds: [[668, 354], [790, 342], [918, 374], [700, 448], [834, 438], [966, 466], [662, 544], [802, 550], [936, 552]]
  }
};

const levelInfo: Record<CastleLevel, { label: string; weight: number; icon: string }> = {
  1: { label: "본성", weight: 2.85, icon: "👑" },
  2: { label: "주요성", weight: 2.25, icon: "🏯" },
  3: { label: "지방성", weight: 1.82, icon: "🏰" }
};

const tileSize = 24;
const tileGap = 2;

function normalizeForceId(force: string | undefined): ForceId {
  if (force === "위나라" || force === "위") return "위나라";
  if (force === "촉나라" || force === "촉") return "촉나라";
  return "오나라";
}

function normalizeCastleSources(castles: CastleSource[] | undefined): CastleSource[] {
  return (castles ?? []).map((castle) => ({
    ...castle,
    owner: normalizeForceId(castle.owner),
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

function pointInPolygon(x: number, y: number, polygon: number[][]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersects = (yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function makeTilesForPolygon(polygon: number[][]) {
  const xs = polygon.map((point) => point[0]);
  const ys = polygon.map((point) => point[1]);
  const minX = Math.floor(Math.min(...xs) / tileSize) * tileSize;
  const maxX = Math.max(...xs);
  const minY = Math.floor(Math.min(...ys) / tileSize) * tileSize;
  const maxY = Math.max(...ys);
  const tiles: Tile[] = [];

  for (let y = minY; y <= maxY; y += tileSize) {
    for (let x = minX; x <= maxX; x += tileSize) {
      const cx = x + tileSize / 2;
      const cy = y + tileSize / 2;
      if (pointInPolygon(cx, cy, polygon)) {
        tiles.push({ x: x + tileGap / 2, y: y + tileGap / 2, cx, cy, size: tileSize - tileGap });
      }
    }
  }

  return tiles;
}

function createCastleSeeds(force: ForceId, sourceCastles: CastleSource[], tiles: Tile[]) {
  const layout = forceLayouts[force];
  const seeds = sourceCastles
    .map((source, index) => {
      if (Number.isFinite(source.x) && Number.isFinite(source.y)) {
        return { cx: source.x as number, cy: source.y as number };
      }

      const markerSeed = layout.markerSeeds[index];
      if (markerSeed) {
        return { cx: markerSeed[0], cy: markerSeed[1] };
      }

      return null;
    })
    .filter(Boolean) as Array<{ cx: number; cy: number }>;

  const remainingTiles = [...tiles];

  while (seeds.length < sourceCastles.length && remainingTiles.length) {
    let bestTile = remainingTiles[0];
    let bestDistance = -1;

    remainingTiles.forEach((tile) => {
      const minDistance = seeds.length === 0
        ? Number.POSITIVE_INFINITY
        : Math.min(...seeds.map((seed) => Math.hypot(seed.cx - tile.cx, seed.cy - tile.cy)));

      if (minDistance > bestDistance) {
        bestDistance = minDistance;
        bestTile = tile;
      }
    });

    seeds.push({ cx: bestTile.cx, cy: bestTile.cy });
  }

  return seeds;
}

function generateForceCastles(force: ForceId, sourceCastles: CastleSource[]) {
  const layout = forceLayouts[force];
  const tiles = makeTilesForPolygon(layout.polygon);
  const seeds = createCastleSeeds(force, sourceCastles, tiles);

  const castles: Castle[] = sourceCastles.map((source, index) => {
    const fallbackSeed = seeds[index] ?? { cx: layout.markerSeeds[index]?.[0] ?? 0, cy: layout.markerSeeds[index]?.[1] ?? 0 };
    const cityX = Number.isFinite(source.x) ? (source.x as number) : fallbackSeed.cx;
    const cityY = Number.isFinite(source.y) ? (source.y as number) : fallbackSeed.cy;

    return {
      id: source.castleKey,
      name: source.name,
      level: source.level,
      origin: force,
      owner: normalizeForceId(source.owner),
      cx: cityX,
      cy: cityY,
      territoryCx: cityX,
      territoryCy: cityY,
      cells: []
    };
  });

  return { force, castles, tiles };
}

function buildCastles(data: CastleData) {
  const regions = forceIds.map((force) => generateForceCastles(force, data.forces[force] ?? []));
  const castles = regions.flatMap((region) => region.castles);
  const castleOrder = new Map(regions.flatMap((region) => region.castles.map((castle, index) => [castle.id, index] as const)));
  const sharedTiles = new Map<string, { tile: Tile; forces: Set<ForceId> }>();

  regions.forEach((region) => {
    region.tiles.forEach((tile) => {
      const key = `${tile.x}:${tile.y}`;
      const existing = sharedTiles.get(key);
      if (existing) {
        existing.forces.add(region.force);
      } else {
        sharedTiles.set(key, { tile, forces: new Set([region.force]) });
      }
    });
  });

  sharedTiles.forEach(({ tile, forces }) => {
    let nearest: Castle | undefined;
    let nearestScore = Number.POSITIVE_INFINITY;

    castles.forEach((castle) => {
      if (!forces.has(castle.origin)) return;

      const distance = Math.hypot(tile.cx - castle.territoryCx, tile.cy - castle.territoryCy) / levelInfo[castle.level].weight;
      const index = castleOrder.get(castle.id) ?? 0;
      const score = distance + index * 0.01;

      if (score < nearestScore) {
        nearestScore = score;
        nearest = castle;
      }
    });

    nearest?.cells.push(tile);
  });

  return castles;
}

function getFirstCastleId(data: CastleData) {
  return [
    ...data.forces.위나라,
    ...data.forces.촉나라,
    ...data.forces.오나라
  ][0]?.castleKey ?? "";
}

export function MapViewer({ compact = false, initialData }: { compact?: boolean; initialData?: RawCastleData }) {
  const initialCastleData = useMemo(() => initialData ? normalizeCastleData(initialData) : emptyCastleData, [initialData]);
  const [castleData, setCastleData] = useState<CastleData>(initialCastleData);
  const [selectedCityId, setSelectedCityId] = useState(() => getFirstCastleId(initialCastleData));
  const [isLoading, setIsLoading] = useState(!initialData);

  const loadCastles = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/castles?fresh=1", { cache: "no-store" });
      const data = await response.json() as RawCastleData;
      const normalized = normalizeCastleData(data);

      setCastleData(normalized);

      const allCastles = [
        ...normalized.forces.위나라,
        ...normalized.forces.촉나라,
        ...normalized.forces.오나라
      ];

      setSelectedCityId((current) => {
        if (current && allCastles.some((castle) => castle.castleKey === current)) {
          return current;
        }
        return allCastles[0]?.castleKey ?? "";
      });
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

  const castles = useMemo(() => buildCastles(castleData), [castleData]);

  const summary = forceIds.reduce<Record<ForceId, number>>((acc, force) => {
    acc[force] = castles.filter((castle) => castle.owner === force).length;
    return acc;
  }, { 위나라: 0, 촉나라: 0, 오나라: 0 });

  const renderMapLayers = () => (
    <>
      <rect x="0" y="0" width="1180" height="720" fill="#d8bd8b" />
      <image className="admin-map-art" href="/assets/three-kingdoms-scroll-map.webp" x="0" y="0" width="1180" height="720" preserveAspectRatio="xMidYMid slice" />

      <g id="territories">
        {castles.map((castle) => (
          <g key={castle.id}>
            {castle.cells.map((cell, index) => (
              <rect
                key={`${castle.id}-${index}`}
                className={`admin-territory ${selectedCityId === castle.id ? "selected" : ""}`}
                data-owner={forceThemeClass[castle.owner]}
                data-city-id={castle.id}
                data-level={castle.level}
                x={cell.x}
                y={cell.y}
                width={cell.size}
                height={cell.size}
                onClick={() => setSelectedCityId(castle.id)}
              />
            ))}
          </g>
        ))}
      </g>

      <g id="cities">
        {castles.map((castle) => (
          <g key={`city-${castle.id}`}>
            <text className={`admin-city-icon level-${castle.level}`} x={castle.cx} y={castle.cy + 7}>{levelInfo[castle.level].icon}</text>
            <text className={`admin-city-label level-${castle.level}`} x={castle.cx + (castle.level === 1 ? 17 : 15)} y={castle.cy + 6}>{castle.name}</text>
          </g>
        ))}
      </g>

      <text className="admin-force-label wei" x="590" y="68">위나라</text>
      <text className="admin-force-label shu" x="360" y="680">촉나라</text>
      <text className="admin-force-label wu" x="865" y="680">오나라</text>
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
        </div>

        <div className="admin-top-summary" aria-label="세력별 보유 성 수">
          {forceIds.map((force) => (
            <div key={force} className={`admin-top-summary-card ${forceThemeClass[force]}`}>
              <span>{forceLayouts[force].label}</span>
              <b>{summary[force]}</b>
            </div>
          ))}
        </div>
      </div>

      <div className={`admin-map-wrap ${compact ? "compact" : ""}`}>
        <svg id="map-viewer" className="map-svg-desktop" viewBox="0 0 1180 720" role="img" aria-label="플레이어 삼국지 지도">
          {renderMapLayers()}
        </svg>
        <svg className="map-svg-mobile" viewBox="36 176 1108 356" role="img" aria-label="모바일 플레이어 삼국지 지도">
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

      <p className="map-disclaimer">
        본 지도는 시청자의 이해를 돕기 위해 재구성한 것으로, 실제 서버 내 성 위치와는 무관합니다.
      </p>
    </section>
  );
}
