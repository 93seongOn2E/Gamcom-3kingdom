"use client";

import { RefreshCcw, RotateCcw, Undo2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type MouseEvent as ReactMouseEvent } from "react";
import {
  blockedTerritoryTiles,
  getTerritoryTilePosition,
  specialTerritoryNumbers,
  territoryFacilityIcons,
  territoryFacilityOptions,
  type TerritoryFacility,
  type TerritoryOwnerFull
} from "@/lib/territory-map-config";
import { getStreamerMode, STREAMER_MODE_EVENT } from "@/lib/streamer-mode";

type ForceId = "위나라" | "촉나라" | "오나라";
type CastleLevel = 1 | 2 | 3;

type CastleSource = {
  castleKey: string;
  name: string;
  level: CastleLevel;
  owner: string;
  isCapital?: boolean;
  isCheonrimun?: boolean;
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
  isCheonrimun: boolean;
  facilityType: TerritoryFacility;
  cx: number;
  cy: number;
};

type SimulationPopoverPosition = {
  left: number;
  top: number;
  placement: "above" | "below" | "center";
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

const simulationStorageKey = "gc-territory-simulation-v1";
const simulationCookieKey = "gc_territory_simulation";
const simulationOwnerCodes: Record<TerritoryOwnerFull, string> = {
  위나라: "w",
  촉나라: "s",
  오나라: "o",
  미점령: "u"
};
const simulationCodeOwners: Record<string, TerritoryOwnerFull> = {
  w: "위나라",
  s: "촉나라",
  o: "오나라",
  u: "미점령"
};
const simulationFacilityCodes: Record<TerritoryFacility, string> = {
  없음: "n",
  병영: "b",
  성채: "f",
  장원: "m"
};
const simulationCodeFacilities: Record<string, TerritoryFacility> = {
  n: "없음",
  b: "병영",
  f: "성채",
  m: "장원"
};
const simulationFacilityIcons: Record<TerritoryFacility, string> = {
  없음: "−",
  병영: "⚔️",
  성채: "🛡️",
  장원: "🏠"
};

function serializeSimulationOwners(data: CastleData, baseline: CastleData) {
  const baselineState = new Map(
    forceIds
      .flatMap((force) => baseline.forces[force])
      .map((castle) => [
        castle.name,
        [
          simulationOwnerCodes[normalizeOwner(castle.owner)],
          castle.isCapital ? "1" : "0",
          simulationFacilityCodes[normalizeFacility(castle.facilityType)],
          castle.isCheonrimun ? "1" : "0"
        ].join(":")
      ])
  );

  return forceIds
    .flatMap((force) => data.forces[force])
    .filter((castle) => {
      const state = [
        simulationOwnerCodes[normalizeOwner(castle.owner)],
        castle.isCapital ? "1" : "0",
        simulationFacilityCodes[normalizeFacility(castle.facilityType)],
        castle.isCheonrimun ? "1" : "0"
      ].join(":");
      return state !== baselineState.get(castle.name);
    })
    .map((castle) => [
      castle.name,
      simulationOwnerCodes[normalizeOwner(castle.owner)],
      castle.isCapital ? "1" : "0",
      simulationFacilityCodes[normalizeFacility(castle.facilityType)],
      castle.isCheonrimun ? "1" : "0"
    ].join(":"))
    .join(",");
}

function applySimulationOwners(data: CastleData, serialized: string) {
  const states = new Map(
    serialized
      .split(",")
      .map((entry) => entry.split(":"))
      .filter((entry) => entry.length >= 2 && Boolean(simulationCodeOwners[entry[1]]))
      .map(([number, ownerCode, capitalOrLegacyCode, facilityCode, cheonrimunCode]) => {
        const isNewFormat = capitalOrLegacyCode === "0" || capitalOrLegacyCode === "1";
        const legacyFacility = simulationCodeFacilities[capitalOrLegacyCode];

        return [
          number,
          {
            owner: simulationCodeOwners[ownerCode],
            isCapital: isNewFormat ? capitalOrLegacyCode === "1" : capitalOrLegacyCode === "c",
            facility: isNewFormat ? simulationCodeFacilities[facilityCode] : legacyFacility,
            isCheonrimun: isNewFormat && cheonrimunCode !== undefined ? cheonrimunCode === "1" : undefined
          }
        ];
      })
  );

  return {
    forces: Object.fromEntries(
      forceIds.map((force) => [
        force,
        data.forces[force].map((castle) => {
          const state = states.get(castle.name);
          if (!state?.owner) return castle;

          const keepsExistingDetails = state.owner === normalizeOwner(castle.owner);
          const isCapital = state.isCapital ?? (keepsExistingDetails ? Boolean(castle.isCapital) : false);
          const facility = state.facility ?? (keepsExistingDetails ? normalizeFacility(castle.facilityType) : "없음");
          const isCheonrimun = state.isCheonrimun ?? (keepsExistingDetails ? Boolean(castle.isCheonrimun) : false);

          return {
            ...castle,
            owner: state.owner,
            isCapital: state.owner !== "미점령" && isCapital,
            isCheonrimun: state.owner !== "미점령" && isCheonrimun,
            facilityType: state.owner === "미점령" ? "없음" : facility
          };
        })
      ])
    ) as CastleData["forces"]
  };
}

function getSimulationCookie() {
  const prefix = `${simulationCookieKey}=`;
  const value = document.cookie.split("; ").find((entry) => entry.startsWith(prefix));
  return value ? decodeURIComponent(value.slice(prefix.length)) : null;
}

function getPersistedSimulation() {
  try {
    return window.sessionStorage.getItem(simulationStorageKey) ?? getSimulationCookie();
  } catch {
    return getSimulationCookie();
  }
}

function persistSimulation(data: CastleData, baseline: CastleData) {
  const serialized = serializeSimulationOwners(data, baseline);
  try {
    window.sessionStorage.setItem(simulationStorageKey, serialized);
  } catch {
    // 세션 저장소를 차단한 브라우저에서는 세션 쿠키만 사용합니다.
  }
  document.cookie = `${simulationCookieKey}=${encodeURIComponent(serialized)}; Path=/; SameSite=Lax`;
}

function clearSimulation() {
  try {
    window.sessionStorage.removeItem(simulationStorageKey);
  } catch {
    // 세션 쿠키 초기화는 계속 진행합니다.
  }
  document.cookie = `${simulationCookieKey}=; Path=/; Max-Age=0; SameSite=Lax`;
}

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
    isCheonrimun: Boolean(castle.isCheonrimun),
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
        isCheonrimun: normalizeOwner(source.owner) === "미점령" ? false : Boolean(source.isCheonrimun),
        facilityType: normalizeOwner(source.owner) === "미점령" ? "없음" : normalizeFacility(source.facilityType),
        cx: Number.isFinite(source.x) ? (source.x as number) : fallback.cx,
        cy: Number.isFinite(source.y) ? (source.y as number) : fallback.cy
      };
    })
    .filter((castle): castle is MapCastle => castle !== null)
    .sort((left, right) => left.number - right.number);
}

export function MapViewer({
  compact = false,
  initialData,
  simulation = false
}: {
  compact?: boolean;
  initialData?: RawCastleData;
  simulation?: boolean;
}) {
  const initialCastleData = useMemo(() => initialData ? normalizeCastleData(initialData) : emptyCastleData, [initialData]);
  const [castleData, setCastleData] = useState<CastleData>(initialCastleData);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [isLoading, setIsLoading] = useState(!initialData);
  const [simulationHistory, setSimulationHistory] = useState<CastleData[]>([]);
  const [simulationPopover, setSimulationPopover] = useState<SimulationPopoverPosition | null>(null);
  const [isStreamerModeOn, setIsStreamerModeOn] = useState(true);

  useEffect(() => {
    const handleStreamerModeChange = (event: Event) => {
      setIsStreamerModeOn((event as CustomEvent<boolean>).detail);
    };

    setIsStreamerModeOn(getStreamerMode());
    window.addEventListener(STREAMER_MODE_EVENT, handleStreamerModeChange);
    return () => window.removeEventListener(STREAMER_MODE_EVENT, handleStreamerModeChange);
  }, []);

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

  useEffect(() => {
    if (!simulation) return;

    try {
      const stored = getPersistedSimulation();
      if (stored) {
        setCastleData(applySimulationOwners(initialCastleData, stored));
      }
    } catch {
      clearSimulation();
    }
  }, [initialCastleData, simulation]);

  const updateSimulatedOwner = useCallback((castleId: string, owner: TerritoryOwnerFull) => {
    const next: CastleData = {
      forces: Object.fromEntries(
        forceIds.map((force) => [
          force,
          castleData.forces[force].map((castle) => castle.castleKey === castleId
            ? {
                ...castle,
                owner,
                isCapital: owner === normalizeOwner(castle.owner) ? castle.isCapital : false,
                isCheonrimun: owner === normalizeOwner(castle.owner) ? castle.isCheonrimun : false,
                facilityType: owner === normalizeOwner(castle.owner) ? castle.facilityType : "없음"
              }
            : castle)
        ])
      ) as CastleData["forces"]
    };

    setSimulationHistory((history) => [...history.slice(-29), castleData]);
    setCastleData(next);
    persistSimulation(next, initialCastleData);
    setSelectedCityId(castleId);
    if (owner === "미점령") {
      setSimulationPopover(null);
    }
  }, [castleData, initialCastleData]);

  const toggleSimulatedCapital = useCallback((castleId: string) => {
    const selectedSource = forceIds
      .flatMap((force) => castleData.forces[force])
      .find((castle) => castle.castleKey === castleId);
    if (!selectedSource || normalizeOwner(selectedSource.owner) === "미점령") return;

    const selectedOwner = normalizeOwner(selectedSource.owner);
    const nextIsCapital = !selectedSource.isCapital;
    const next: CastleData = {
      forces: Object.fromEntries(
        forceIds.map((force) => [
          force,
          castleData.forces[force].map((castle) => {
            if (castle.castleKey === castleId) {
              return { ...castle, isCapital: nextIsCapital };
            }

            if (nextIsCapital && normalizeOwner(castle.owner) === selectedOwner && castle.isCapital) {
              return { ...castle, isCapital: false };
            }

            return castle;
          })
        ])
      ) as CastleData["forces"]
    };

    setSimulationHistory((history) => [...history.slice(-29), castleData]);
    setCastleData(next);
    persistSimulation(next, initialCastleData);
  }, [castleData, initialCastleData]);

  const toggleSimulatedCheonrimun = useCallback((castleId: string) => {
    const selectedSource = forceIds
      .flatMap((force) => castleData.forces[force])
      .find((castle) => castle.castleKey === castleId);
    if (!selectedSource || normalizeOwner(selectedSource.owner) === "미점령") return;

    const next: CastleData = {
      forces: Object.fromEntries(
        forceIds.map((force) => [
          force,
          castleData.forces[force].map((castle) => castle.castleKey === castleId
            ? { ...castle, isCheonrimun: !castle.isCheonrimun }
            : castle)
        ])
      ) as CastleData["forces"]
    };

    setSimulationHistory((history) => [...history.slice(-29), castleData]);
    setCastleData(next);
    persistSimulation(next, initialCastleData);
  }, [castleData, initialCastleData]);

  const updateSimulatedFacility = useCallback((castleId: string, facility: TerritoryFacility) => {
    const selectedSource = forceIds
      .flatMap((force) => castleData.forces[force])
      .find((castle) => castle.castleKey === castleId);
    if (!selectedSource || normalizeOwner(selectedSource.owner) === "미점령") return;

    const selectedOwner = normalizeOwner(selectedSource.owner);
    const manorCount = forceIds
      .flatMap((force) => castleData.forces[force])
      .filter((castle) => normalizeOwner(castle.owner) === selectedOwner && normalizeFacility(castle.facilityType) === "장원")
      .length;
    if (facility === "장원" && normalizeFacility(selectedSource.facilityType) !== "장원" && manorCount >= 10) {
      return;
    }

    const next: CastleData = {
      forces: Object.fromEntries(
        forceIds.map((force) => [
          force,
          castleData.forces[force].map((castle) => {
            if (castle.castleKey === castleId) {
              return { ...castle, facilityType: facility };
            }

            return castle;
          })
        ])
      ) as CastleData["forces"]
    };

    setSimulationHistory((history) => [...history.slice(-29), castleData]);
    setCastleData(next);
    persistSimulation(next, initialCastleData);
    setSimulationPopover(null);
  }, [castleData, initialCastleData]);

  const handleTerritoryClick = useCallback((
    event: ReactMouseEvent<SVGRectElement>,
    castleId: string
  ) => {
    setSelectedCityId(castleId);
    if (!simulation) return;

    const mapWrap = event.currentTarget.closest(".admin-map-wrap");
    if (!(mapWrap instanceof HTMLElement)) return;

    const tileRect = event.currentTarget.getBoundingClientRect();
    const wrapRect = mapWrap.getBoundingClientRect();
    const relativeTop = tileRect.top - wrapRect.top;
    const relativeBottom = tileRect.bottom - wrapRect.top;
    // 수도/시설 설정까지 포함한 실제 높이를 넉넉하게 잡아 가운데 행에서도
    // 아래쪽으로 잘못 배치되어 잘리지 않도록 합니다.
    const estimatedPopoverHeight = wrapRect.width <= 520 ? 460 : 390;
    const placement = relativeTop >= estimatedPopoverHeight + 12
      ? "above"
      : wrapRect.height - relativeBottom >= estimatedPopoverHeight + 12
        ? "below"
        : "center";

    const left = ((tileRect.left + tileRect.width / 2 - wrapRect.left) / wrapRect.width) * 100;

    setSimulationPopover({
      left: Math.min(82, Math.max(18, left)),
      top: placement === "center"
        ? 50
        : (((placement === "above" ? tileRect.top : tileRect.bottom) - wrapRect.top) / wrapRect.height) * 100,
      placement
    });
  }, [simulation]);

  const undoSimulation = useCallback(() => {
    const previous = simulationHistory.at(-1);
    if (!previous) return;

    setCastleData(previous);
    setSimulationHistory((history) => history.slice(0, -1));
    persistSimulation(previous, initialCastleData);
    setSimulationPopover(null);
  }, [initialCastleData, simulationHistory]);

  const resetSimulation = useCallback(() => {
    setCastleData(initialCastleData);
    setSimulationHistory([]);
    setSelectedCityId("");
    setSimulationPopover(null);
    clearSimulation();
  }, [initialCastleData]);

  const castles = useMemo(() => buildMapCastles(castleData), [castleData]);
  const selectedCastle = castles.find((castle) => castle.id === selectedCityId);
  const selectedNationManorCount = selectedCastle?.owner === "미점령" || !selectedCastle
    ? 0
    : castles.filter((castle) => castle.owner === selectedCastle.owner && castle.facilityType === "장원").length;
  const selectedAdjacentCastles = useMemo(() => {
    if (!selectedCastle || selectedCastle.owner === "미점령") return [];

    const selectedTile = getTerritoryTilePosition(selectedCastle.number);
    if (!selectedTile) return [];
    const hasBarracksRange = simulation && selectedCastle.facilityType === "병영";

    return castles.filter((castle) => {
      if (castle.owner !== "미점령") return false;

      const tile = getTerritoryTilePosition(castle.number);
      if (!tile) return false;

      const rowDistance = Math.abs(tile.row - selectedTile.row);
      const columnDistance = Math.abs(tile.column - selectedTile.column);

      if (hasBarracksRange) {
        return rowDistance <= 1 && columnDistance <= 1 && rowDistance + columnDistance > 0;
      }

      return rowDistance + columnDistance === 1;
    });
  }, [castles, selectedCastle, simulation]);
  const summary = forceIds.reduce<Record<ForceId, number>>((acc, force) => {
    acc[force] = castles.filter((castle) => castle.owner === force).length;
    return acc;
  }, { 위나라: 0, 촉나라: 0, 오나라: 0 });
  const hideMapFacilities = !simulation && isStreamerModeOn;

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
          const hasFacility = !hideMapFacilities && castle.facilityType !== "없음";
          const hasCheonrimun = !hideMapFacilities && castle.isCheonrimun;
          const hasDetails = hasFacility || hasCheonrimun;
          const isSpecial = specialTerritoryNumbers.has(castle.number);
          const isUnclaimedSpecial = isSpecial && castle.owner === "미점령";
          const numberY = hasDetails ? castle.cy - 9 : castle.cy + 6;
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
                onClick={(event) => handleTerritoryClick(event, castle.id)}
              />
              <text
                className={`map-territory-number ${hasDetails ? "has-facility" : ""} ${isUnclaimedSpecial ? "is-special-unclaimed" : ""}`}
                x={castle.cx}
                y={numberY}
              >
                {!hideMapFacilities && castle.isCapital ? <tspan className="map-territory-inline-crown">👑</tspan> : null}
                <tspan>{castle.name}</tspan>
              </text>
              {isSpecial ? (
                <text className="map-territory-special-star" x={castle.cx + 16} y={castle.cy - 13}>★</text>
              ) : null}
              {hasFacility ? (
                <g className="map-territory-detail" data-facility={castle.facilityType}>
                  <title>{castle.facilityType}</title>
                  <text className="map-territory-facility-icon" x={castle.cx + (hasCheonrimun ? -8 : 0)} y={facilityY}>
                    {territoryFacilityIcons[castle.facilityType]}
                  </text>
                </g>
              ) : null}
              {hasCheonrimun ? (
                <g className="map-territory-detail" data-facility="천리문">
                  <title>천리문</title>
                  <text className="map-territory-facility-icon" x={castle.cx + (hasFacility ? 8 : 0)} y={facilityY}>
                    🟣
                  </text>
                </g>
              ) : null}
            </g>
          );
        })}
      </g>

      {selectedCastle && selectedCastle.owner !== "미점령" ? (
        <g
          className="map-territory-selection-neighbors"
          data-owner={forceThemeClass[selectedCastle.owner]}
          transform={viewerTerritoryTransform}
          aria-hidden="true"
        >
          {selectedAdjacentCastles.map((castle) => (
            <rect
              key={castle.id}
              className="map-territory-selection-neighbor"
              data-territory-number={castle.number}
              x={castle.cx - viewerTerritoryTileSize / 2}
              y={castle.cy - viewerTerritoryTileSize / 2}
              width={viewerTerritoryTileSize}
              height={viewerTerritoryTileSize}
              rx="3"
              ry="3"
            />
          ))}
        </g>
      ) : null}

    </>
  );

  return (
    <section className={`map-viewer-shell pixel-frame overflow-hidden ${simulation ? "simulation" : ""} ${compact ? "compact p-3 md:p-4" : "p-4 md:p-6"}`}>
      {simulation ? (
        <div className="simulation-toolbar" aria-label="점령 시뮬레이터 도구">
          <div className="simulation-toolbar-main">
            <div className="simulation-toolbar-title-row">
              <span className="simulation-toolbar-guide">
                <b>사용 방법</b>
                <span>지도에서 영지 클릭</span>
                <i>→</i>
                <span>나타난 버튼에서 상태 선택</span>
              </span>
            </div>
          </div>

          <div className="simulation-toolbar-actions">
            <button type="button" onClick={undoSimulation} disabled={simulationHistory.length === 0}>
              <Undo2 size={15} />
              실행 취소
            </button>
            <button type="button" onClick={resetSimulation}>
              <RotateCcw size={15} />
              초기화
            </button>
          </div>
        </div>
      ) : null}

      <div className={`flex flex-col gap-3 md:mb-4 md:flex-row md:items-end md:justify-between ${compact ? "mb-3" : "mb-4"}`}>
        <div className="map-viewer-heading">
          <h2 className="text-2xl font-black text-[#f3e7d0]">{simulation ? "점령 시뮬레이터" : "삼국지 점령 지도"}</h2>
          {!simulation ? <button
            type="button"
            onClick={() => void loadCastles()}
            disabled={isLoading}
            className="map-refresh-button"
            aria-label="점령 지도 새로고침"
            title="점령 지도 새로고침"
          >
            <RefreshCcw size={15} className={isLoading ? "animate-spin" : ""} />
            <span>새로고침</span>
          </button> : null}
          <div className="map-territory-legend" aria-label={hideMapFacilities ? "지도 아이콘 설명" : "수도, 거점 및 천리문 아이콘 설명"}>
            {!hideMapFacilities ? <span><b>👑</b> 수도</span> : null}
            {!hideMapFacilities ? <span><b>⚔️</b> 병영</span> : null}
            {!hideMapFacilities ? <span><b>🛡️</b> 성채</span> : null}
            {!hideMapFacilities ? <span><b>🏠</b> 장원</span> : null}
            {!hideMapFacilities ? <span><b>🟣</b> 천리문</span> : null}
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

      <div
        className={`admin-map-wrap ${simulation ? "simulation" : ""} ${compact ? "compact" : ""}`}
        onClick={(event) => {
          if (!simulation) return;

          const target = event.target;
          if (!(target instanceof Element)) return;
          if (target.closest(".simulation-cell-popover") || target.closest(".admin-territory[data-city-id]")) return;
          setSimulationPopover(null);
        }}
      >
        <svg id="map-viewer" className="map-svg-desktop" viewBox="0 0 1180 720" preserveAspectRatio="none" role="img" aria-label="60개 지역으로 구성된 삼국지 지도">
          {renderMapLayers()}
        </svg>
        <svg className="map-svg-mobile" viewBox={simulation ? "220 75 760 520" : "190 35 820 610"} preserveAspectRatio="none" role="img" aria-label="60개 지역으로 구성된 모바일 삼국지 지도">
          {renderMapLayers()}
        </svg>

        {simulation && selectedCastle && simulationPopover ? (
          <div
            className="simulation-cell-popover"
            data-placement={simulationPopover.placement}
            role="dialog"
            aria-label={`${selectedCastle.number}번 영지 상태 선택`}
            style={{ left: `${simulationPopover.left}%`, top: `${simulationPopover.top}%` }}
          >
            <div className="simulation-cell-popover-head">
              <strong>{selectedCastle.number}번 영지</strong>
              <span>점령 상태와 시설을 설정하세요</span>
              <button type="button" onClick={() => setSimulationPopover(null)} aria-label="상태 선택 닫기">×</button>
            </div>
            <div className="simulation-cell-section-head">
              <strong>점령 상태</strong>
            </div>
            <div className="simulation-cell-options">
              {(["미점령", ...forceIds] as TerritoryOwnerFull[]).map((owner) => (
                <button
                  key={owner}
                  type="button"
                  data-owner={forceThemeClass[owner]}
                  className={selectedCastle.owner === owner ? "current" : ""}
                  aria-pressed={selectedCastle.owner === owner}
                  onClick={() => updateSimulatedOwner(selectedCastle.id, owner)}
                >
                  {owner}
                </button>
              ))}
            </div>
            <div className="simulation-cell-section-head facility">
              <strong>수도</strong>
              <span>일반 시설과 별도 설정</span>
            </div>
            <button
              type="button"
              className={`simulation-capital-toggle ${selectedCastle.isCapital ? "current" : ""}`}
              aria-pressed={selectedCastle.isCapital}
              disabled={selectedCastle.owner === "미점령"}
              onClick={() => toggleSimulatedCapital(selectedCastle.id)}
            >
              <span aria-hidden="true">👑</span>
              {selectedCastle.isCapital ? "수도 해제" : "수도로 지정"}
            </button>
            <div className="simulation-cell-section-head facility">
              <strong>일반 시설</strong>
              <span>
                {selectedCastle.owner === "미점령" ? "국가 선택 필요" : `${selectedCastle.owner} 장원 `}
                {selectedCastle.owner !== "미점령" ? <><b>{selectedNationManorCount}</b> / 10</> : null}
              </span>
            </div>
            <div className="simulation-cell-facilities">
              {territoryFacilityOptions.map((facility) => {
                const manorLimitReached = facility === "장원"
                  && selectedCastle.facilityType !== "장원"
                  && selectedNationManorCount >= 10;
                const disabled = selectedCastle.owner === "미점령" || manorLimitReached;

                return (
                  <button
                    key={facility}
                    type="button"
                    data-facility={facility}
                    className={selectedCastle.facilityType === facility ? "current" : ""}
                    aria-pressed={selectedCastle.facilityType === facility}
                    disabled={disabled}
                    title={manorLimitReached ? "장원은 최대 10개까지 설치할 수 있습니다." : undefined}
                    onClick={() => updateSimulatedFacility(selectedCastle.id, facility)}
                  >
                    <span aria-hidden="true">{simulationFacilityIcons[facility]}</span>
                    {facility}
                  </button>
                );
              })}
            </div>
            {selectedCastle.owner === "미점령" ? (
              <p className="simulation-cell-facility-hint">시설을 추가하려면 먼저 점령 국가를 선택하세요.</p>
            ) : selectedNationManorCount >= 10 && selectedCastle.facilityType !== "장원" ? (
              <p className="simulation-cell-facility-hint limit">{selectedCastle.owner} 장원 10개가 모두 설치되어 있습니다.</p>
            ) : null}
            <div className="simulation-cell-section-head facility">
              <strong>천리문</strong>
              <span>수도 및 일반 시설과 별도 설정</span>
            </div>
            <button
              type="button"
              className={`simulation-capital-toggle ${selectedCastle.isCheonrimun ? "current" : ""}`}
              aria-pressed={selectedCastle.isCheonrimun}
              disabled={selectedCastle.owner === "미점령"}
              onClick={() => toggleSimulatedCheonrimun(selectedCastle.id)}
            >
              <span aria-hidden="true">🟣</span>
              {selectedCastle.isCheonrimun ? "천리문 해제" : "천리문 설치"}
            </button>
            <button
              type="button"
              className="simulation-cell-close-button"
              onClick={() => setSimulationPopover(null)}
            >
              닫기
            </button>
          </div>
        ) : null}

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
