"use client";

import { useEffect, useMemo, useState } from "react";

type ForceId = "위" | "촉" | "오";
type CastleLevel = 1 | 2 | 3;

type CastleSource = {
  castleKey: string;
  name: string;
  level: CastleLevel;
  x?: number;
  y?: number;
};

type CastleData = {
  forces: Record<ForceId, CastleSource[]>;
};

type MapConfig = {
  counts?: Partial<Record<ForceId, number>>;
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
  areaScale: number;
  origin: ForceId;
  owner: ForceId;
  cx: number;
  cy: number;
  territoryCx: number;
  territoryCy: number;
  cells: Tile[];
};

const forceIds: ForceId[] = ["위", "촉", "오"];

const forceThemeClass: Record<ForceId, "wei" | "shu" | "wu"> = {
  위: "wei",
  촉: "shu",
  오: "wu"
};

const forceLayouts: Record<ForceId, { label: string; polygon: number[][]; markerSeeds: number[][] }> = {
  위: {
    label: "위나라",
    polygon: [[318, 132], [422, 86], [584, 88], [736, 116], [842, 168], [818, 270], [704, 352], [520, 362], [374, 306], [286, 234]],
    markerSeeds: [[370, 162], [494, 154], [618, 156], [742, 182], [432, 226], [565, 220], [690, 244], [540, 292], [761, 270]]
  },
  촉: {
    label: "촉나라",
    polygon: [[176, 330], [334, 302], [494, 322], [606, 374], [604, 476], [520, 588], [352, 616], [196, 562], [144, 436]],
    markerSeeds: [[240, 354], [362, 326], [490, 346], [560, 408], [250, 456], [386, 444], [510, 488], [314, 548], [452, 560]]
  },
  오: {
    label: "오나라",
    polygon: [[606, 304], [760, 278], [900, 304], [1030, 372], [1042, 512], [946, 604], [786, 624], [638, 556], [570, 420]],
    markerSeeds: [[668, 354], [790, 342], [918, 374], [700, 448], [834, 438], [966, 466], [662, 544], [802, 550], [936, 552]]
  }
};

const tileSize = 24;
const tileGap = 2;

const levelInfo: Record<CastleLevel, { label: string; weight: number; icon: string }> = {
  1: { label: "본성", weight: 2.85, icon: "👑" },
  2: { label: "주요성", weight: 2.25, icon: "🏰" },
  3: { label: "지방성", weight: 1.82, icon: "🚩" }
};

function normalizeCastleSources(castles: CastleSource[]) {
  return castles.map((castle) => ({
    ...castle,
    level: castle.level as CastleLevel,
    x: Number.isFinite(castle.x) ? castle.x : undefined,
    y: Number.isFinite(castle.y) ? castle.y : undefined
  }));
}

function normalizeCastleData(data: CastleData): CastleData {
  return {
    forces: {
      위: normalizeCastleSources(data.forces.위 ?? []),
      촉: normalizeCastleSources(data.forces.촉 ?? []),
      오: normalizeCastleSources(data.forces.오 ?? [])
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

function generateForceCastles(force: ForceId, sourceCastles: CastleSource[], previousOwners: Map<string, ForceId>) {
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
      areaScale: 1,
      origin: force,
      owner: previousOwners.get(source.castleKey) ?? force,
      cx: cityX,
      cy: cityY,
      territoryCx: cityX,
      territoryCy: cityY,
      cells: []
    };
  });

  return { force, castles, tiles };
}

function buildCastles(data: CastleData, counts: Record<ForceId, number>, previousOwners: Map<string, ForceId>) {
  const regions = forceIds.map((force) => generateForceCastles(force, data.forces[force].slice(0, counts[force]), previousOwners));
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

      const weight = levelInfo[castle.level].weight * castle.areaScale;
      const distance = Math.hypot(tile.cx - castle.territoryCx, tile.cy - castle.territoryCy) / weight;
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

export function AdminMapEditor() {
  const [castleData, setCastleData] = useState<CastleData>({
    forces: {
      위: [],
      촉: [],
      오: []
    }
  });
  const [previousOwners, setPreviousOwners] = useState<Map<string, ForceId>>(new Map());
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedForce, setSelectedForce] = useState<ForceId>("위");
  useEffect(() => {
    Promise.all([
      fetch("/api/castles", { cache: "no-store" }).then(async (response) => {
        const data = await response.json() as CastleData & { message?: string };
        if (!response.ok) throw new Error(data.message || "성 데이터를 불러오지 못했습니다.");
        return data;
      }),
      fetch("/data/map-config.json", { cache: "no-store" })
        .then((response) => response.json() as Promise<MapConfig>)
        .catch(() => ({ counts: { 위: 9, 촉: 9, 오: 9 } }))
    ])
      .then(([data, config]) => {
        const normalized = normalizeCastleData(data);
        const counts = {
          위: Math.min(config.counts?.위 ?? 9, normalized.forces.위.length),
          촉: Math.min(config.counts?.촉 ?? 9, normalized.forces.촉.length),
          오: Math.min(config.counts?.오 ?? 9, normalized.forces.오.length)
        };

        setCastleData({
          forces: {
            위: normalized.forces.위.slice(0, counts.위),
            촉: normalized.forces.촉.slice(0, counts.촉),
            오: normalized.forces.오.slice(0, counts.오)
          }
        });

        const firstCastle =
          normalized.forces.위[0] ??
          normalized.forces.촉[0] ??
          normalized.forces.오[0];
        if (firstCastle) setSelectedCityId(firstCastle.castleKey);
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "성 데이터를 불러오지 못했습니다.");
      });
  }, []);

  const counts = useMemo<Record<ForceId, number>>(() => ({
    위: castleData.forces.위.length,
    촉: castleData.forces.촉.length,
    오: castleData.forces.오.length
  }), [castleData]);

  const castles = useMemo(() => buildCastles(castleData, counts, previousOwners), [castleData, counts, previousOwners]);
  const selectedCastle = castles.find((castle) => castle.id === selectedCityId) ?? castles[0];

  useEffect(() => {
    if (selectedCastle && selectedCityId !== selectedCastle.id) {
      setSelectedCityId(selectedCastle.id);
    }
  }, [selectedCastle, selectedCityId]);

  useEffect(() => {
    if (selectedCastle) {
      setSelectedForce(selectedCastle.owner);
    }
  }, [selectedCastle]);

  const summary = forceIds.reduce<Record<ForceId, number>>((acc, force) => {
    acc[force] = castles.filter((castle) => castle.owner === force).length;
    return acc;
  }, { 위: 0, 촉: 0, 오: 0 });

  function updateSelectedCastle(patch: Partial<CastleSource>) {
    if (!selectedCastle) return;

    setCastleData((current) => ({
      forces: {
        ...current.forces,
        [selectedCastle.origin]: current.forces[selectedCastle.origin].map((castle) => (
          castle.castleKey === selectedCastle.id
            ? { ...castle, ...patch }
            : castle
        ))
      }
    }));
  }

  async function applySelectedCastle() {
    if (!selectedCastle) return;

    const x = Math.round(selectedCastle.cx);
    const y = Math.round(selectedCastle.cy);

    try {
      const response = await fetch("/api/castles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          castleKey: selectedCastle.id,
          name: selectedCastle.name,
          level: selectedCastle.level,
          x,
          y,
          kingdom: selectedForce
        })
      });

      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || "좌표 저장에 실패했습니다.");

      setPreviousOwners((current) => {
        const next = new Map(current);
        next.set(selectedCastle.id, selectedForce);
        return next;
      });

      window.alert(`${selectedCastle.name} 정보를 저장했습니다.`);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "정보를 저장하지 못했습니다.");
    }
  }

  return (
    <div className="admin-map-shell">
      <section className="admin-map-panel" aria-label="삼국지 점령 지도">
        <div className="admin-map-topbar">
          <div>
            <p className="admin-eyebrow">Three Kingdoms Territory</p>
            <h2>삼국지 점령 지도</h2>
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

        <div className="admin-map-wrap">
          <svg id="map" viewBox="0 0 1180 720" role="img" aria-label="위 촉 오 영역으로 구분된 삼국지 지도">
            <rect x="0" y="0" width="1180" height="720" fill="#d8bd8b" />
            <image className="admin-map-art" href="/assets/three-kingdoms-scroll-map.png" x="0" y="0" width="1180" height="720" preserveAspectRatio="xMidYMid slice" />

            <g id="territories">
              {castles.map((castle) => (
                <g key={castle.id} className="castle-territory" data-city-id={castle.id} data-level={castle.level}>
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
                      onClick={() => {
                        setSelectedCityId(castle.id);
                      }}
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
          </svg>
        </div>
      </section>

      <aside className="admin-control-panel" aria-label="지도 편집">
        <div className="admin-panel-heading">
          <p className="admin-eyebrow">Control</p>
          <h2>점령권 편집</h2>
        </div>

        <label className="admin-field">
          <span>대상 성</span>
          <select value={selectedCityId} onChange={(event) => setSelectedCityId(event.target.value)} disabled={!castles.length}>
            {castles.map((castle) => (
              <option key={castle.id} value={castle.id}>{castle.name} · Lv.{castle.level} {levelInfo[castle.level].label} ({forceLayouts[castle.owner].label})</option>
            ))}
          </select>
        </label>

        {selectedCastle ? (
          <section className="admin-edit-panel" aria-label="선택 성 편집">
            <div className="admin-panel-heading compact-heading">
              <p className="admin-eyebrow">Admin</p>
              <h2>선택 성 편집</h2>
            </div>

            <label className="admin-field">
              <span>성 이름</span>
              <input value={selectedCastle.name} maxLength={12} onChange={(event) => updateSelectedCastle({ name: event.target.value })} />
            </label>

            <label className="admin-field">
              <span>성 등급</span>
              <select value={selectedCastle.level} onChange={(event) => updateSelectedCastle({ level: Number(event.target.value) as CastleLevel })}>
                <option value={1}>Lv.1 본성</option>
                <option value={2}>Lv.2 주요성</option>
                <option value={3}>Lv.3 지방성</option>
              </select>
            </label>

            <div className="admin-coord-grid">
              <label className="admin-field compact">
                <span>표시 X</span>
                <input
                  type="number"
                  min={0}
                  max={1180}
                  value={Math.round(selectedCastle.cx)}
                  onChange={(event) => updateSelectedCastle({ x: Number(event.target.value) })}
                />
              </label>

              <label className="admin-field compact">
                <span>표시 Y</span>
                <input
                  type="number"
                  min={0}
                  max={720}
                  value={Math.round(selectedCastle.cy)}
                  onChange={(event) => updateSelectedCastle({ y: Number(event.target.value) })}
                />
              </label>
            </div>
          </section>
        ) : (
          <div className="admin-field">
            <span>상태</span>
            <p>선택된 성이 없습니다.</p>
          </div>
        )}

        <div className="admin-field">
          <span>점령 세력</span>
          <div className="admin-segmented" role="group" aria-label="점령 세력 선택">
            {forceIds.map((force) => (
              <button
                key={force}
                type="button"
                data-force={forceThemeClass[force]}
                className={selectedForce === force ? "active" : ""}
                onClick={() => setSelectedForce(force)}
                disabled={!selectedCastle}
              >
                {forceLayouts[force].label}
              </button>
            ))}
          </div>
        </div>

        <button className="admin-capture" type="button" onClick={applySelectedCastle} disabled={!selectedCastle}>적용</button>
      </aside>
    </div>
  );
}
