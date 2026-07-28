"use client";

import { useEffect, useMemo, useState } from "react";
import {
  blockedTerritoryTiles,
  getTerritoryTilePosition,
  specialTerritoryNumbers,
  territoryFacilityIcons,
  territoryFacilityOptions,
  territoryTileSize,
  type TerritoryFacility,
  type TerritoryOwnerShort
} from "@/lib/territory-map-config";

type ForceId = "위" | "촉" | "오";
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

type MapCastle = {
  id: string;
  name: string;
  number: number;
  level: CastleLevel;
  origin: ForceId;
  owner: TerritoryOwnerShort;
  isCapital: boolean;
  facilityType: TerritoryFacility;
  cx: number;
  cy: number;
};

const forceIds: ForceId[] = ["위", "촉", "오"];
const ownerOptions: TerritoryOwnerShort[] = ["미점령", "위", "촉", "오"];

const forceThemeClass: Record<TerritoryOwnerShort, "wei" | "shu" | "wu" | "unclaimed"> = {
  위: "wei",
  촉: "shu",
  오: "wu",
  미점령: "unclaimed"
};

const forceLabels: Record<TerritoryOwnerShort, string> = {
  위: "위나라",
  촉: "촉나라",
  오: "오나라",
  미점령: "미점령"
};

function normalizeOwner(owner: string | undefined): TerritoryOwnerShort {
  if (owner === "위" || owner === "촉" || owner === "오") {
    return owner;
  }
  return "미점령";
}

function normalizeFacility(facility: string | undefined): TerritoryFacility {
  return territoryFacilityOptions.includes(facility as TerritoryFacility)
    ? (facility as TerritoryFacility)
    : "없음";
}

function normalizeCastleData(data: CastleData): CastleData {
  return {
    forces: {
      위: data.forces?.위 ?? [],
      촉: data.forces?.촉 ?? [],
      오: data.forces?.오 ?? []
    }
  };
}

function buildMapCastles(data: CastleData): MapCastle[] {
  return forceIds
    .flatMap((origin) => data.forces[origin].map((source) => ({ source, origin })))
    .map(({ source, origin }) => {
      const number = Number.parseInt(source.name, 10);
      const fallback = getTerritoryTilePosition(number);

      if (!Number.isInteger(number) || !fallback) {
        return null;
      }

      return {
        id: source.castleKey,
        name: String(number),
        number,
        level: source.level,
        origin,
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

export function AdminMapEditor() {
  const [castleData, setCastleData] = useState<CastleData>({
    forces: {
      위: [],
      촉: [],
      오: []
    }
  });
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedOwner, setSelectedOwner] = useState<TerritoryOwnerShort>("미점령");
  const [selectedIsCapital, setSelectedIsCapital] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<TerritoryFacility>("없음");

  useEffect(() => {
    fetch("/api/castles", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json() as CastleData & { message?: string };
        if (!response.ok) throw new Error(data.message || "지역 데이터를 불러오지 못했습니다.");
        return data;
      })
      .then((data) => {
        const normalized = normalizeCastleData(data);
        setCastleData(normalized);

        const allCastles = buildMapCastles(normalized);
        setSelectedCityId(allCastles[0]?.id ?? "");
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "지역 데이터를 불러오지 못했습니다.");
      });
  }, []);

  const castles = useMemo(() => buildMapCastles(castleData), [castleData]);
  const selectedCastle = castles.find((castle) => castle.id === selectedCityId) ?? castles[0];

  useEffect(() => {
    if (selectedCastle) {
      setSelectedCityId(selectedCastle.id);
      setSelectedOwner(selectedCastle.owner);
      setSelectedIsCapital(selectedCastle.isCapital);
      setSelectedFacility(selectedCastle.facilityType);
    }
  }, [selectedCastle]);

  const summary = forceIds.reduce<Record<ForceId, number>>((acc, force) => {
    acc[force] = castles.filter((castle) => castle.owner === force).length;
    return acc;
  }, { 위: 0, 촉: 0, 오: 0 });

  async function applySelectedCastle() {
    if (!selectedCastle) return;

    try {
      const response = await fetch("/api/castles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          castleKey: selectedCastle.id,
          name: selectedCastle.name,
          level: selectedCastle.level,
          x: Math.round(selectedCastle.cx),
          y: Math.round(selectedCastle.cy),
          kingdom: selectedOwner,
          isCapital: selectedOwner === "미점령" ? false : selectedIsCapital,
          facilityType: selectedOwner === "미점령" ? "없음" : selectedFacility
        })
      });

      const result = await response.json() as {
        message?: string;
        kingdom?: TerritoryOwnerShort;
        isCapital?: boolean;
        facilityType?: TerritoryFacility;
      };
      if (!response.ok) throw new Error(result.message || "점령 상태 저장에 실패했습니다.");

      const savedOwner = result.kingdom ?? selectedOwner;
      const savedIsCapital = result.isCapital ?? (savedOwner === "미점령" ? false : selectedIsCapital);
      const savedFacility = result.facilityType ?? (savedOwner === "미점령" ? "없음" : selectedFacility);

      setCastleData((current) => {
        const nextForces = { ...current.forces };

        for (const force of forceIds) {
          nextForces[force] = current.forces[force].map((castle) => {
            if (castle.castleKey === selectedCastle.id) {
              return {
                ...castle,
                owner: savedOwner,
                isCapital: savedIsCapital,
                facilityType: savedFacility
              };
            }

            if (savedIsCapital && normalizeOwner(castle.owner) === savedOwner) {
              return { ...castle, isCapital: false };
            }

            return castle;
          });
        }

        return { forces: nextForces };
      });

      window.alert(`${selectedCastle.name}번 지역의 점령 상태를 저장했습니다.`);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "점령 상태를 저장하지 못했습니다.");
    }
  }

  return (
    <div className="admin-map-shell">
      <section className="admin-map-panel" aria-label="삼국지 점령 지도">
        <div className="admin-map-topbar">
          <div>
            <p className="admin-eyebrow">Territory</p>
            <h2>삼국지 점령 지도</h2>
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

        <div className="admin-map-wrap">
          <svg id="map" viewBox="0 0 1180 720" role="img" aria-label="60개 지역으로 구성된 삼국지 지도">
            <rect x="0" y="0" width="1180" height="720" fill="#d8bd8b" />
            <image className="admin-map-art" href="/assets/three-kingdoms-scroll-map.webp" x="0" y="0" width="1180" height="720" preserveAspectRatio="xMidYMid slice" />

            <g id="blocked-territories" aria-label="점령 불가 지역">
              {blockedTerritoryTiles.map((tile) => (
                <rect
                  key={tile.id}
                  className="admin-territory map-fixed-tile"
                  data-owner="blocked"
                  x={tile.cx - territoryTileSize / 2}
                  y={tile.cy - territoryTileSize / 2}
                  width={territoryTileSize}
                  height={territoryTileSize}
                />
              ))}
            </g>

            <g id="territories">
              {castles.map((castle) => {
                const hasFacility = castle.facilityType !== "없음";
                const isSpecial = specialTerritoryNumbers.has(castle.number);
                const isUnclaimedSpecial = isSpecial && castle.owner === "미점령";
                const numberY = hasFacility ? castle.cy - 8 : castle.cy + 6;

                return (
                  <g key={castle.id}>
                    <rect
                      className={`admin-territory map-fixed-tile ${selectedCityId === castle.id ? "selected" : ""}`}
                      data-owner={forceThemeClass[castle.owner]}
                      data-special={isSpecial ? "buff" : undefined}
                      data-city-id={castle.id}
                      x={castle.cx - territoryTileSize / 2}
                      y={castle.cy - territoryTileSize / 2}
                      width={territoryTileSize}
                      height={territoryTileSize}
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
                      <text
                        className="map-territory-facility-icon"
                        x={castle.cx}
                        y={castle.cy + 14}
                      >
                        {territoryFacilityIcons[castle.facilityType]}
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </section>

      <aside className="admin-control-panel" aria-label="지도 편집">
        <div className="admin-panel-heading">
          <p className="admin-eyebrow">Control</p>
          <h2>점령 상태 편집</h2>
        </div>

        <label className="admin-field">
          <span>대상 지역</span>
          <select value={selectedCityId} onChange={(event) => setSelectedCityId(event.target.value)} disabled={!castles.length}>
            {castles.map((castle) => (
              <option key={castle.id} value={castle.id}>
                {castle.name}번 · {forceLabels[castle.owner]}
              </option>
            ))}
          </select>
        </label>

        <div className="admin-field">
          <span>점령 세력</span>
          <div className="admin-segmented admin-segmented-four" role="group" aria-label="점령 세력 선택">
            {ownerOptions.map((owner) => (
              <button
                key={owner}
                type="button"
                data-force={forceThemeClass[owner]}
                className={selectedOwner === owner ? "active" : ""}
                onClick={() => {
                  setSelectedOwner(owner);
                  if (owner === "미점령") {
                    setSelectedIsCapital(false);
                    setSelectedFacility("없음");
                  }
                }}
                disabled={!selectedCastle}
              >
                {forceLabels[owner]}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-field">
          <span>수도 설정</span>
          <label className="admin-capital-checkbox-row">
            <input
              className="admin-capital-checkbox"
              type="checkbox"
              checked={selectedIsCapital}
              onChange={(event) => setSelectedIsCapital(event.target.checked)}
              disabled={!selectedCastle || selectedOwner === "미점령"}
            />
            <span>수도로 지정</span>
          </label>
          <small>수도는 거점과 별도로 지정되며, 각 나라에 하나만 설정됩니다.</small>
        </div>

        <label className="admin-field">
          <span>거점</span>
          <select
            value={selectedFacility}
            onChange={(event) => setSelectedFacility(event.target.value as TerritoryFacility)}
            disabled={!selectedCastle || selectedOwner === "미점령"}
          >
            {territoryFacilityOptions.map((facility) => (
              <option key={facility} value={facility}>
                {facility}
              </option>
            ))}
          </select>
          <small>병영·성채·장원 중 하나만 건설할 수 있습니다.</small>
        </label>

        <button className="admin-capture" type="button" onClick={applySelectedCastle} disabled={!selectedCastle}>
          적용
        </button>
      </aside>
    </div>
  );
}
