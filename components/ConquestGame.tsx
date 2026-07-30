"use client";

import { Play, RotateCcw, ShieldAlert, Sparkles, Swords } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  blockedTerritoryTiles,
  specialTerritoryNumbers,
  territoryTiles
} from "@/lib/territory-map-config";

type Nation = "위나라" | "촉나라" | "오나라";
type Owner = Nation | "미점령";
type GamePhase = "setup" | "playing" | "finished";
type Owners = Record<number, Owner>;

const nations: Nation[] = ["위나라", "촉나라", "오나라"];
const nationTheme: Record<Nation, "wei" | "shu" | "wu"> = {
  위나라: "wei",
  촉나라: "shu",
  오나라: "wu"
};
const nationStartingTerritory: Record<Nation, number> = {
  위나라: 8,
  촉나라: 42,
  오나라: 47
};
const weiOpeningPlansAgainstShu = [
  [7, 6, 13, 19],
  [7, 14, 20, 19],
  [7, 14, 20, 28]
];
const wuLowerFlankResponse = [46, 54, 53, 59];
const startingFunds = 10_000_000;
const conquestCost = 500_000;
const tileSize = 53;
const mapTransform = "translate(0 35) translate(580 331) scale(1.18) translate(-580 -331)";

function createInitialOwners(): Owners {
  return Object.fromEntries(
    territoryTiles.map((tile) => [
      tile.number,
      nations.find((nation) => nationStartingTerritory[nation] === tile.number) ?? "미점령"
    ])
  ) as Owners;
}

function getTile(number: number) {
  return territoryTiles.find((tile) => tile.number === number);
}

function getAdjacentNumbers(number: number) {
  const source = getTile(number);
  if (!source) return [];

  return territoryTiles
    .filter((tile) => Math.abs(tile.row - source.row) + Math.abs(tile.column - source.column) === 1)
    .map((tile) => tile.number);
}

function getDistanceToBuff(number: number) {
  return getTerritoryDistance(number, 27);
}

function getTerritoryDistance(from: number, to: number) {
  if (from === to) return 0;

  const visited = new Set([from]);
  let frontier = [from];
  let distance = 0;

  while (frontier.length > 0) {
    distance += 1;
    const nextFrontier: number[] = [];

    for (const current of frontier) {
      for (const adjacent of getAdjacentNumbers(current)) {
        if (adjacent === to) return distance;
        if (visited.has(adjacent)) continue;
        visited.add(adjacent);
        nextFrontier.push(adjacent);
      }
    }

    frontier = nextFrontier;
  }

  return Number.POSITIVE_INFINITY;
}

function getDistanceToNation(owners: Owners, from: number, targetNation?: Nation) {
  if (!targetNation) return Number.POSITIVE_INFINITY;

  const targetTerritories = territoryTiles
    .filter((tile) => owners[tile.number] === targetNation)
    .map((tile) => tile.number);
  if (targetTerritories.length === 0) return Number.POSITIVE_INFINITY;

  return Math.min(
    ...targetTerritories.map((target) => getTerritoryDistance(from, target))
  );
}

function getDistanceBetweenNations(owners: Owners, left: Nation, right: Nation) {
  const leftTerritories = territoryTiles
    .filter((tile) => owners[tile.number] === left)
    .map((tile) => tile.number);
  const rightTerritories = territoryTiles
    .filter((tile) => owners[tile.number] === right)
    .map((tile) => tile.number);
  if (leftTerritories.length === 0 || rightTerritories.length === 0) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.min(
    ...leftTerritories.flatMap((from) =>
      rightTerritories.map((to) => getTerritoryDistance(from, to))
    )
  );
}

function getNearbyThreatNation(owners: Owners, nation: Nation) {
  const enemies = nations
    .filter((enemy) => enemy !== nation)
    .map((enemy) => ({
      nation: enemy,
      distance: getDistanceBetweenNations(owners, nation, enemy)
    }))
    .sort((left, right) => left.distance - right.distance);

  return enemies[0]?.distance <= 3 ? enemies[0].nation : undefined;
}

function getFocusPressureScore(
  owners: Owners,
  target: number,
  focusNation?: Nation
) {
  if (!focusNation) return 0;

  const focusTargets = getConquerableTargets(owners, focusNation);
  const stealsFocusTarget = focusTargets.includes(target) ? 1 : 0;
  const newlyInterferedTargets = focusTargets.filter(
    (focusTarget) => getAdjacentNumbers(focusTarget).includes(target)
  ).length;
  const distance = getDistanceToNation(owners, target, focusNation);
  const proximityScore = Number.isFinite(distance) ? Math.max(0, 7 - distance) : 0;

  // 사용자가 바로 먹을 수 있는 칸을 먼저 선점하고, 남은 선택지 주변에
  // 견제를 많이 만드는 진격을 높게 평가합니다.
  return stealsFocusTarget * 12 + newlyInterferedTargets * 4 + proximityScore;
}

function getScores(owners: Owners) {
  return nations.reduce<Record<Nation, number>>((scores, nation) => {
    scores[nation] = Object.values(owners).filter((owner) => owner === nation).length;
    return scores;
  }, { 위나라: 0, 촉나라: 0, 오나라: 0 });
}

function getConquerableTargets(owners: Owners, nation: Nation) {
  const candidates = new Set<number>();

  territoryTiles.forEach((tile) => {
    if (owners[tile.number] !== nation) return;
    getAdjacentNumbers(tile.number).forEach((number) => {
      if (owners[number] === "미점령") candidates.add(number);
    });
  });

  return [...candidates];
}

function getInterference(owners: Owners, nation: Nation, target: number) {
  const enemyTiles = getAdjacentNumbers(target)
    .map((number) => owners[number])
    .filter((owner): owner is Nation => owner !== "미점령" && owner !== nation);
  const interferingNations = [...new Set(enemyTiles)];

  return {
    count: interferingNations.length,
    nations: interferingNations
  };
}

function getConquestChance(owners: Owners, nation: Nation, target: number) {
  const interference = getInterference(owners, nation, target);
  const baseChance = 100 * (0.5 ** interference.count);
  const buff = owners[27] === nation ? 5 : 0;
  return Math.min(100, baseChance + buff);
}

function getExpansionScore(owners: Owners, nation: Nation, target: number) {
  return getAdjacentNumbers(target).filter((nextNumber) => {
    if (owners[nextNumber] !== "미점령") return false;

    return !getAdjacentNumbers(nextNumber).some(
      (nearbyNumber) => owners[nearbyNumber] === nation
    );
  }).length;
}

function getFutureExpansionScore(
  owners: Owners,
  nation: Nation,
  target: number,
  depth = 3
): number {
  const targetsBefore = new Set(getConquerableTargets(owners, nation));
  const nextOwners: Owners = { ...owners, [target]: nation };
  const targetsAfter = getConquerableTargets(nextOwners, nation);
  const newlyOpened = targetsAfter.filter((number) => !targetsBefore.has(number));
  const immediateScore = newlyOpened.length;

  if (depth <= 1 || targetsAfter.length === 0) return immediateScore;

  const bestFollowingScore = Math.max(
    0,
    ...targetsAfter.map((nextTarget) =>
      getFutureExpansionScore(nextOwners, nation, nextTarget, depth - 1)
    )
  );

  // 가까운 한 칸만 보는 대신 앞으로 이어질 진출로를 함께 평가합니다.
  return immediateScore + bestFollowingScore * 0.72;
}

function getTrailingGap(owners: Owners, nation: Nation) {
  const scores = getScores(owners);
  return Math.max(...nations.map((candidate) => scores[candidate])) - scores[nation];
}

function shouldAttemptBuffTerritory(
  owners: Owners,
  nation: Nation,
  targets: number[]
) {
  if (owners[27] !== "미점령" || !targets.includes(27)) return false;

  const chance = getConquestChance(owners, nation, 27);
  if (chance === 100) return true;

  const trailingBonus = Math.min(0.18, getTrailingGap(owners, nation) * 0.04);
  const attemptRate = chance >= 50 ? 0.62 + trailingBonus : 0.28 + trailingBonus;
  return Math.random() < attemptRate;
}

function selectBreakoutTarget(
  owners: Owners,
  nation: Nation,
  targets: number[],
  safeTargets: number[],
  focusNation?: Nation
) {
  const contestedGateways = targets.filter(
    (target) =>
      target !== 27
      && getConquestChance(owners, nation, target) >= 50
      && getExpansionScore(owners, nation, target) > 0
  );
  if (contestedGateways.length === 0) return null;

  const bestGateway = [...contestedGateways].sort((left, right) => {
    const futureDifference =
      getFutureExpansionScore(owners, nation, right, 4)
      - getFutureExpansionScore(owners, nation, left, 4);
    if (Math.abs(futureDifference) > 0.001) return futureDifference;

    const pressureDifference =
      getFocusPressureScore(owners, right, focusNation)
      - getFocusPressureScore(owners, left, focusNation);
    return pressureDifference || left - right;
  })[0];
  const safeFrontier = safeTargets.filter(
    (target) => getExpansionScore(owners, nation, target) > 0
  );
  const bestSafeFuture = Math.max(
    0,
    ...safeFrontier.map((target) => getFutureExpansionScore(owners, nation, target, 4))
  );
  const gatewayFuture = getFutureExpansionScore(owners, nation, bestGateway, 4);
  const trailingGap = getTrailingGap(owners, nation);
  const isGettingBoxedIn =
    safeFrontier.length <= 1
    || gatewayFuture > bestSafeFuture + 0.7;
  if (!isGettingBoxedIn && trailingGap < 2) return null;

  // 오른쪽 출발인 오나라는 진출 통로가 적어 내부 영지를 모두 채운 뒤에는
  // 이미 봉쇄되는 경우가 많으므로, 유리한 접경 통로를 조금 더 일찍 노립니다.
  const wuBreakoutBonus = nation === "오나라" ? 0.16 : 0;
  const attemptRate = Math.min(
    0.58,
    0.1 + wuBreakoutBonus + Math.min(0.2, trailingGap * 0.04)
  );

  return Math.random() < attemptRate ? bestGateway : null;
}

function selectAiTarget(
  owners: Owners,
  nation: Nation,
  focusNation?: Nation,
  preferredOpeningTarget?: number,
  previousFrontTarget?: number,
  allowStrategicRisk = true
) {
  const targets = getConquerableTargets(owners, nation);
  if (targets.length === 0) return null;

  const safeTargets = targets.filter(
    (target) => getInterference(owners, nation, target).count === 0
  );

  if (
    safeTargets.includes(27)
    || (allowStrategicRisk && shouldAttemptBuffTerritory(owners, nation, targets))
  ) {
    return 27;
  }

  if (safeTargets.length > 0) {
    const hasReachedBuffFront = getAdjacentNumbers(27).some(
      (number) => owners[number] === nation
    );
    const frontierTargets = safeTargets.filter(
      (target) => getExpansionScore(owners, nation, target) > 0
    );
    // 새로운 길을 여는 안전한 영지가 하나라도 있으면, 언제든 나중에
    // 정리할 수 있는 후방 영지는 이번 판단에서 제외합니다.
    const safeCandidates = frontierTargets.length > 0 ? frontierTargets : safeTargets;
    const nearbyThreatNation = getNearbyThreatNation(owners, nation);
    const pressureNation = nearbyThreatNation ?? focusNation;
    const breakoutTarget = allowStrategicRisk
      ? selectBreakoutTarget(
          owners,
          nation,
          targets,
          safeTargets,
          pressureNation
        )
      : null;
    if (breakoutTarget !== null) return breakoutTarget;

    const continuationTargets = previousFrontTarget === undefined
      ? []
      : safeCandidates.filter(
          (target) =>
            getAdjacentNumbers(previousFrontTarget).includes(target)
            && getExpansionScore(owners, nation, target) > 0
        );
    const strategicCandidates = continuationTargets.length > 0
      ? continuationTargets
      : safeCandidates;

    return [...strategicCandidates].sort((left, right) => {
      if (nearbyThreatNation) {
        const pressureDifference =
          getFocusPressureScore(owners, right, pressureNation) -
          getFocusPressureScore(owners, left, pressureNation);
        if (pressureDifference) return pressureDifference;

        const focusDistanceDifference =
          getDistanceToNation(owners, left, pressureNation) -
          getDistanceToNation(owners, right, pressureNation);
        if (focusDistanceDifference) return focusDistanceDifference;
      }

      if (owners[27] === "미점령" && !hasReachedBuffFront) {
        const buffRouteDifference = getDistanceToBuff(left) - getDistanceToBuff(right);
        if (buffRouteDifference) return buffRouteDifference;
      }

      const leftMatchesOpening = left === preferredOpeningTarget;
      const rightMatchesOpening = right === preferredOpeningTarget;
      if (leftMatchesOpening !== rightMatchesOpening) return rightMatchesOpening ? 1 : -1;

      const futureExpansionDifference =
        getFutureExpansionScore(owners, nation, right) -
        getFutureExpansionScore(owners, nation, left);
      if (Math.abs(futureExpansionDifference) > 0.001) return futureExpansionDifference;

      const focusDistanceDifference =
        getDistanceToNation(owners, left, pressureNation) -
        getDistanceToNation(owners, right, pressureNation);
      if (focusDistanceDifference) return focusDistanceDifference;

      const expansionDifference =
        getExpansionScore(owners, nation, right) - getExpansionScore(owners, nation, left);
      return expansionDifference || left - right;
    })[0];
  }

  return [...targets].sort((left, right) => {
    const chanceDifference =
      getConquestChance(owners, nation, right) - getConquestChance(owners, nation, left);
    if (chanceDifference) return chanceDifference;
    if (left === 27) return -1;
    if (right === 27) return 1;

    const leftOpensFront = getExpansionScore(owners, nation, left) > 0;
    const rightOpensFront = getExpansionScore(owners, nation, right) > 0;
    if (leftOpensFront !== rightOpensFront) return rightOpensFront ? 1 : -1;

    const nearbyThreatNation = getNearbyThreatNation(owners, nation);
    if (previousFrontTarget !== undefined) {
      const leftContinues = getAdjacentNumbers(previousFrontTarget).includes(left);
      const rightContinues = getAdjacentNumbers(previousFrontTarget).includes(right);
      if (leftContinues !== rightContinues) return rightContinues ? 1 : -1;
    }

    const pressureNation = nearbyThreatNation ?? focusNation;
    const leftMatchesOpening = left === preferredOpeningTarget;
    const rightMatchesOpening = right === preferredOpeningTarget;
    if (leftMatchesOpening !== rightMatchesOpening) return rightMatchesOpening ? 1 : -1;

    const pressureDifference =
      getFocusPressureScore(owners, right, pressureNation) -
      getFocusPressureScore(owners, left, pressureNation);
    if (pressureDifference) return pressureDifference;

    const focusDistanceDifference =
      getDistanceToNation(owners, left, pressureNation) -
      getDistanceToNation(owners, right, pressureNation);
    if (focusDistanceDifference) return focusDistanceDifference;

    const futureExpansionDifference =
      getFutureExpansionScore(owners, nation, right) -
      getFutureExpansionScore(owners, nation, left);
    if (Math.abs(futureExpansionDifference) > 0.001) return futureExpansionDifference;

    const expansionDifference =
      getExpansionScore(owners, nation, right) - getExpansionScore(owners, nation, left);
    return expansionDifference || left - right;
  })[0];
}

function selectAiPressureTarget(
  owners: Owners,
  nation: Nation,
  focusNation?: Nation
) {
  const targets = getConquerableTargets(owners, nation).filter(
    (target) => target === 18 || getInterference(owners, nation, target).count > 0
  );
  if (targets.length === 0) return null;

  return [...targets].sort((left, right) => {
    if (left === 18) return -1;
    if (right === 18) return 1;

    const chanceDifference =
      getConquestChance(owners, nation, right) -
      getConquestChance(owners, nation, left);
    if (chanceDifference) return chanceDifference;

    const pressureDifference =
      getFocusPressureScore(owners, right, focusNation) -
      getFocusPressureScore(owners, left, focusNation);
    return pressureDifference || left - right;
  })[0];
}

function formatInterferenceNations(interferingNations: Nation[]) {
  if (interferingNations.length === 0) return "";
  if (interferingNations.length === 1) return interferingNations[0];
  return `${interferingNations.slice(0, -1).join(", ")}와 ${interferingNations.at(-1)}`;
}

function attemptConquest(owners: Owners, nation: Nation, target: number) {
  const chance = getConquestChance(owners, nation, target);
  const interference = getInterference(owners, nation, target);
  const success = Math.random() * 100 < chance;
  const nextOwners = success ? { ...owners, [target]: nation } : owners;

  return {
    owners: nextOwners,
    success,
    chance,
    text: success
      ? `${nation}가 ${target}번 영지를 점령했습니다.`
      : `인접한 ${formatInterferenceNations(interference.nations)}의 방해로 ${nation}가 ${target}번 영지 점령에 실패했습니다.`
  };
}

function settleWar(startingOwners: Owners) {
  let owners = { ...startingOwners };

  for (let wave = 0; wave < territoryTiles.length; wave += 1) {
    const assignments: Array<[number, Nation]> = [];

    territoryTiles.forEach((tile) => {
      if (owners[tile.number] !== "미점령") return;

      const adjacentNations = [...new Set(
        getAdjacentNumbers(tile.number)
          .map((number) => owners[number])
          .filter((owner): owner is Nation => owner !== "미점령")
      )];
      if (adjacentNations.length === 0) return;

      const guaranteedNation = adjacentNations.find(
        (nation) => getConquestChance(owners, nation, tile.number) === 100
      );
      if (guaranteedNation) assignments.push([tile.number, guaranteedNation]);
    });

    if (assignments.length === 0) break;
    owners = assignments.reduce<Owners>(
      (next, [number, nation]) => ({ ...next, [number]: nation }),
      owners
    );
  }

  return owners;
}

function selectAiFinalGamble(
  owners: Owners,
  nation: Nation,
  focusNation?: Nation,
  minimumChance = 0
) {
  const riskyTargets = getConquerableTargets(owners, nation).filter(
    (target) => {
      const chance = getConquestChance(owners, nation, target);
      return chance < 100 && chance >= minimumChance;
    }
  );
  if (riskyTargets.length === 0) return null;

  const settledFailureScore = getScores(settleWar(owners))[nation];

  return [...riskyTargets].sort((left, right) => {
    const getExpectedGain = (target: number) => {
      const chance = getConquestChance(owners, nation, target) / 100;
      const successOwners: Owners = { ...owners, [target]: nation };
      const settledSuccessScore = getScores(settleWar(successOwners))[nation];
      return (settledSuccessScore - settledFailureScore) * chance;
    };

    const expectedGainDifference = getExpectedGain(right) - getExpectedGain(left);
    if (Math.abs(expectedGainDifference) > 0.001) return expectedGainDifference;

    const chanceDifference =
      getConquestChance(owners, nation, right)
      - getConquestChance(owners, nation, left);
    if (chanceDifference) return chanceDifference;

    const pressureDifference =
      getFocusPressureScore(owners, right, focusNation)
      - getFocusPressureScore(owners, left, focusNation);
    return pressureDifference || left - right;
  })[0];
}

function getWuCentralPressureResponse(
  owners: Owners,
  round: number,
  wuActsBeforeWei: boolean
) {
  const weiIsPressingCenter =
    owners[14] === "위나라"
    || owners[20] === "위나라";
  if (!weiIsPressingCenter || round > 7) {
    return null;
  }
  if (
    wuActsBeforeWei
    && owners[37] === "오나라"
    && owners[27] === "미점령"
  ) {
    return null;
  }

  const conquerableTargets = getConquerableTargets(owners, "오나라");
  return wuLowerFlankResponse.find(
    (target) =>
      owners[target] === "미점령"
      && conquerableTargets.includes(target)
      && getConquestChance(owners, "오나라", target) === 100
  ) ?? null;
}

export function ConquestGame() {
  const [phase, setPhase] = useState<GamePhase>("setup");
  const [playerNation, setPlayerNation] = useState<Nation>("촉나라");
  const [owners, setOwners] = useState<Owners>(createInitialOwners);
  const [round, setRound] = useState(1);
  const [funds, setFunds] = useState(startingFunds);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [isResolvingTurn, setIsResolvingTurn] = useState(false);
  const [turnBanner, setTurnBanner] = useState("");
  const [turnBannerTone, setTurnBannerTone] = useState<"neutral" | "success" | "failure" | "war">("neutral");
  const [recentCapture, setRecentCapture] = useState<number | null>(null);
  const aiFocusTargets = useRef<Partial<Record<Nation, Nation>>>({});
  const aiOpeningPlans = useRef<Partial<Record<Nation, number[]>>>({});
  const aiTurnOrder = useRef<Nation[]>([]);
  const aiFrontTargets = useRef<Partial<Record<Nation, number>>>({});
  const aiTrackedThreats = useRef<Partial<Record<Nation, Nation>>>({});
  const aiRiskRecovery = useRef<Partial<Record<Nation, boolean>>>({});

  const scores = useMemo(() => getScores(owners), [owners]);
  const conquerableTargets = useMemo(
    () => phase === "playing" ? getConquerableTargets(owners, playerNation) : [],
    [owners, phase, playerNation]
  );
  const conquerableTargetSet = useMemo(
    () => new Set(conquerableTargets),
    [conquerableTargets]
  );
  const selectedChance = selectedTarget === null
    ? null
    : getConquestChance(owners, playerNation, selectedTarget);
  const selectedInterference = selectedTarget === null
    ? null
    : getInterference(owners, playerNation, selectedTarget);

  const startGame = () => {
    const aiNations = nations.filter((nation) => nation !== playerNation);
    const bothTargetPlayer = Math.random() < 0.75;
    const guaranteedPlayerHunter = aiNations[Math.floor(Math.random() * aiNations.length)];

    aiFocusTargets.current = Object.fromEntries(
      aiNations.map((nation) => [
        nation,
        bothTargetPlayer || nation === guaranteedPlayerHunter
          ? playerNation
          : aiNations.find((otherAi) => otherAi !== nation) ?? playerNation
      ])
    );
    aiOpeningPlans.current = playerNation === "촉나라"
      ? {
          위나라: weiOpeningPlansAgainstShu[
            Math.floor(Math.random() * weiOpeningPlansAgainstShu.length)
          ]
        }
      : {};
    aiTurnOrder.current = [...aiNations];
    if (Math.random() < 0.5) aiTurnOrder.current.reverse();
    aiFrontTargets.current = {};
    aiTrackedThreats.current = {};
    aiRiskRecovery.current = {};
    setOwners(createInitialOwners());
    setRound(1);
    setFunds(startingFunds);
    setSelectedTarget(null);
    setIsResolvingTurn(false);
    setTurnBanner("");
    setTurnBannerTone("neutral");
    setRecentCapture(null);
    setPhase("playing");
  };

  const wait = (milliseconds: number) => new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });

  const finishRound = async (playerTarget: number | null) => {
    if (isResolvingTurn) return;

    setIsResolvingTurn(true);
    setSelectedTarget(null);
    let nextOwners = owners;
    let playerActionDelay = 750;
    const nextFunds = playerTarget === null ? 0 : Math.max(0, funds - conquestCost);
    setFunds(nextFunds);

    if (playerTarget !== null) {
      setTurnBanner(`${playerNation} 점령 시도`);
      setTurnBannerTone("neutral");
      const result = attemptConquest(nextOwners, playerNation, playerTarget);
      nextOwners = result.owners;
      setOwners(nextOwners);
      setRecentCapture(result.success ? playerTarget : null);
      setTurnBanner(result.success ? `${playerNation} · ${playerTarget}번 점령 성공` : result.text);
      setTurnBannerTone(result.success ? "success" : "failure");
      playerActionDelay = result.success ? 750 : 1250;
    } else {
      setTurnBanner(`${playerNation} 게임 종료`);
      setTurnBannerTone("neutral");
      setRecentCapture(null);
    }

    await wait(playerActionDelay);

    for (const nation of aiTurnOrder.current) {
      setRecentCapture(null);
      setTurnBanner("");
      setTurnBannerTone("neutral");
      await wait(450);

      const activeFocusNation = round > 4 ? aiFocusTargets.current[nation] : undefined;
      const openingPlan = aiOpeningPlans.current[nation];
      const preferredOpeningTarget = openingPlan && round <= openingPlan.length
        ? openingPlan[round - 1]
        : undefined;
      const nearbyThreatNation = getNearbyThreatNation(nextOwners, nation);
      const isNewThreat =
        nearbyThreatNation !== undefined
        && aiTrackedThreats.current[nation] !== nearbyThreatNation;
      if (nearbyThreatNation !== undefined) {
        aiTrackedThreats.current[nation] = nearbyThreatNation;
      }
      const wuActsBeforeWei =
        playerNation !== "위나라"
        && aiTurnOrder.current.indexOf("오나라")
          < aiTurnOrder.current.indexOf("위나라");
      const centralPressureResponse = nation === "오나라"
        ? getWuCentralPressureResponse(nextOwners, round, wuActsBeforeWei)
        : null;
      const neutralTarget = centralPressureResponse
        ?? selectAiTarget(
          nextOwners,
          nation,
          activeFocusNation,
          preferredOpeningTarget,
          isNewThreat ? undefined : aiFrontTargets.current[nation],
          !aiRiskRecovery.current[nation]
        );
      const nationScore = getScores(nextOwners)[nation];
      const pressureTarget = nationScore > 10
        ? selectAiPressureTarget(nextOwners, nation, activeFocusNation)
        : null;
      const shouldAttemptPressureTarget =
        !aiRiskRecovery.current[nation]
        && pressureTarget !== null
        && Math.random() < 0.18;
      const finalGambleTarget = nextFunds === 0
        ? selectAiFinalGamble(nextOwners, nation, activeFocusNation)
        : nextFunds <= 2_500_000
          ? selectAiFinalGamble(nextOwners, nation, activeFocusNation, 50)
        : null;
      const target = finalGambleTarget
        ?? (shouldAttemptPressureTarget ? pressureTarget : neutralTarget);

      if (target === null) {
        setTurnBanner(`${nation} AI · 행동 불가`);
        setTurnBannerTone("neutral");
        await wait(550);
        continue;
      }

      setTurnBanner(`${nation} AI · ${target}번 점령 시도`);
      setTurnBannerTone("neutral");
      const result = attemptConquest(nextOwners, nation, target);
      nextOwners = result.owners;
      setOwners(nextOwners);
      setRecentCapture(result.success ? target : null);
      if (result.success) {
        aiFrontTargets.current[nation] = target;
        aiRiskRecovery.current[nation] = false;
      } else {
        aiRiskRecovery.current[nation] = true;
      }
      setTurnBanner(
        result.success
          ? `${nation} AI · ${target}번 점령 성공`
          : result.text
      );
      setTurnBannerTone(result.success ? "success" : "failure");
      await wait(result.success ? 650 : 1000);
    }

    if (nextFunds === 0) {
      setRecentCapture(null);
      setTurnBanner("전쟁 시작");
      setTurnBannerTone("war");
      await wait(1000);
      const warOwners = settleWar(nextOwners);
      nextOwners = warOwners;
      setOwners(nextOwners);
      setPhase("finished");
    } else {
      setTurnBanner("다음 점령 준비");
      setTurnBannerTone("neutral");
      setRound((current) => current + 1);
      await wait(500);
    }

    setOwners(nextOwners);
    setRecentCapture(null);
    setTurnBanner("");
    setTurnBannerTone("neutral");
    setIsResolvingTurn(false);
  };

  const resetGame = () => {
    setOwners(createInitialOwners());
    setRound(1);
    setFunds(startingFunds);
    setSelectedTarget(null);
    setIsResolvingTurn(false);
    setTurnBanner("");
    setTurnBannerTone("neutral");
    setRecentCapture(null);
    aiFocusTargets.current = {};
    aiOpeningPlans.current = {};
    aiTurnOrder.current = [];
    aiFrontTargets.current = {};
    aiTrackedThreats.current = {};
    aiRiskRecovery.current = {};
    setPhase("setup");
  };

  const renderMapLayers = () => (
    <>
      <rect x="0" y="0" width="1180" height="720" fill="#d8bd8b" />
      <image
        className="admin-map-art"
        href="/assets/three-kingdoms-scroll-map.webp"
        x="0"
        y="0"
        width="1180"
        height="720"
        preserveAspectRatio="xMidYMid slice"
      />

      <g transform={mapTransform} aria-label="점령 불가 지역">
        {blockedTerritoryTiles.map((tile) => (
          <rect
            key={tile.id}
            className="admin-territory map-fixed-tile"
            data-owner="blocked"
            x={tile.cx - tileSize / 2}
            y={tile.cy - tileSize / 2}
            width={tileSize}
            height={tileSize}
          />
        ))}
      </g>

      <g transform={mapTransform}>
        {territoryTiles.map((tile) => {
          const owner = owners[tile.number];
          const targetAvailable = !isResolvingTurn && conquerableTargetSet.has(tile.number);
          const selected = selectedTarget === tile.number;
          const isBuff = specialTerritoryNumbers.has(tile.number);
          const conquestChance = targetAvailable
            ? getConquestChance(owners, playerNation, tile.number)
            : null;

          return (
            <g key={tile.number}>
              <rect
                className={`admin-territory map-fixed-tile conquest-game-tile ${targetAvailable ? "available" : ""} ${selected ? "selected" : ""} ${recentCapture === tile.number ? "captured" : ""}`}
                data-owner={owner === "미점령" ? "unclaimed" : nationTheme[owner]}
                data-special={isBuff ? "buff" : undefined}
                data-territory-number={tile.number}
                x={tile.cx - tileSize / 2}
                y={tile.cy - tileSize / 2}
                width={tileSize}
                height={tileSize}
                onClick={() => {
                  if (phase !== "playing" || isResolvingTurn) return;
                  if (!targetAvailable) {
                    setSelectedTarget(null);
                    return;
                  }
                  setSelectedTarget(tile.number);
                }}
              />
              <text
                className={`map-territory-number ${isBuff && owner === "미점령" ? "is-special-unclaimed" : ""}`}
                x={tile.cx}
                y={targetAvailable ? tile.cy : tile.cy + 6}
              >
                {tile.number}
              </text>
              {conquestChance !== null ? (
                <text
                  className="conquest-game-target-chance"
                  x={tile.cx}
                  y={tile.cy + 17}
                >
                  {conquestChance}%
                </text>
              ) : null}
              {isBuff ? (
                <text className="map-territory-special-star" x={tile.cx + 16} y={tile.cy - 13}>★</text>
              ) : null}
            </g>
          );
        })}
      </g>
    </>
  );

  return (
    <section className="conquest-game">
      {phase === "setup" ? (
        <div className="conquest-game-setup">
          <div className="conquest-game-setup-copy">
            <span><Swords size={18} /> 게임 준비</span>
            <h3>플레이할 국가를 선택하세요</h3>
            <p>내가 선택하지 않은 두 국가는 AI가 담당합니다. 점령 시도 후 AI 두 국가가 차례로 행동합니다.</p>
          </div>
          <div className="conquest-game-nation-options">
            {nations.map((nation) => (
              <button
                key={nation}
                type="button"
                className={`${nationTheme[nation]} ${playerNation === nation ? "selected" : ""}`}
                onClick={() => setPlayerNation(nation)}
              >
                <span>{nationStartingTerritory[nation]}번에서 시작</span>
                <strong>{nation}</strong>
              </button>
            ))}
          </div>
          <button type="button" className="conquest-game-start" onClick={startGame}>
            <Play size={17} fill="currentColor" />
            게임 시작
          </button>
        </div>
      ) : null}

      {phase === "finished" ? (
        <div className="conquest-game-finished-actions">
          <button type="button" onClick={resetGame}><RotateCcw size={16} /> 다시 시작</button>
        </div>
      ) : null}

      <div className="conquest-game-layout">
        <div className="conquest-game-main">
          {phase === "playing" ? (
            <div className="conquest-game-actionbar">
              <div>
                <span>{playerNation} · 점령 비용 🪙500,000</span>
                <strong>
                  {isResolvingTurn
                    ? turnBanner || "상대 국가 차례입니다."
                    : conquerableTargets.length === 0
                    ? "점령 가능한 영지가 없습니다."
                    : selectedTarget === null
                      ? "빛나는 인접 영지를 선택하세요."
                      : `${selectedTarget}번 영지를 점령하시겠습니까?`}
                </strong>
              </div>

              {!isResolvingTurn && selectedTarget !== null && selectedChance !== null && selectedInterference ? (
                <div className="conquest-game-attempt">
                  <p>
                    성공 확률 <b>{selectedChance}%</b>
                    {selectedInterference.count > 0
                      ? <span><ShieldAlert size={14} /> 적국 {selectedInterference.count}개국 견제</span>
                      : <span className="safe">견제 없음</span>}
                  </p>
                  <button type="button" onClick={() => finishRound(selectedTarget)}>
                    <Swords size={16} /> 점령 시도 · 🪙500,000
                  </button>
                </div>
              ) : !isResolvingTurn && conquerableTargets.length === 0 ? (
                <button type="button" className="conquest-game-skip" onClick={() => finishRound(null)}>
                  게임 종료
                </button>
              ) : null}
            </div>
          ) : null}

          <div className="conquest-game-map">
            <svg className="conquest-game-map-desktop" viewBox="0 0 1180 720" preserveAspectRatio="none" role="img" aria-label="점령 시뮬게임 지도">
              {renderMapLayers()}
            </svg>
            <svg className="conquest-game-map-mobile" viewBox="220 75 760 520" preserveAspectRatio="none" role="img" aria-label="모바일 점령 시뮬게임 지도">
              {renderMapLayers()}
            </svg>
            <div className="conquest-game-scoreboard" aria-label="국가별 점령 수">
              {nations.map((nation) => (
                <div
                  key={nation}
                  className={`conquest-game-score ${nationTheme[nation]} ${playerNation === nation && phase !== "setup" ? "player" : ""}`}
                >
                  <span>{nation}{playerNation === nation && phase !== "setup" ? " · 나" : ""}</span>
                  <strong>{scores[nation]}</strong>
                  {owners[27] === nation ? (
                    <b title="27번 영지 버프 적용 중" aria-label="27번 영지 버프 적용 중">
                      <Sparkles size={11} />
                    </b>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="conquest-game-turn conquest-game-turn-map conquest-game-funds">
              <span>{phase === "finished" ? "금화 소진" : "보유 금화"}</span>
              <strong>🪙 {funds.toLocaleString("ko-KR")}</strong>
            </div>
            {phase === "setup" ? <div className="conquest-game-map-lock">국가를 선택하고 게임을 시작하세요</div> : null}
            {isResolvingTurn && turnBanner ? (
              <div
                key={turnBanner}
                className="conquest-turn-banner"
                data-tone={turnBannerTone}
                aria-live="assertive"
              >
                {turnBannerTone === "failure" ? <ShieldAlert size={18} /> : <Swords size={18} />}
                <span>{turnBanner}</span>
              </div>
            ) : null}
          </div>
        </div>

        <aside className="conquest-game-side">
          <div className="conquest-game-rules">
            <h3>게임 설명</h3>
            <ol>
              <li><b>목표</b><span>🪙 10,000,000을 활용해 가장 많은 영지를 확보하세요.</span></li>
              <li><b>인접 점령</b><span>내 영지의 상하좌우만 점령할 수 있습니다.</span></li>
              <li><b>점령 비용</b><span>사용자가 점령을 시도할 때마다 🪙 500,000이 차감됩니다.</span></li>
              <li><b>국가 견제</b><span>인접한 적국 1개국마다 확률이 절반이 됩니다. 같은 국가의 여러 타일은 한 번만 계산합니다.</span></li>
              <li><b>27번 버프</b><span>보유 국가는 점령 성공 확률이 5%p 증가합니다. 예를 들어 50%는 55%가 됩니다.</span></li>
              <li><b>게임 종료</b><span>금화가 소진되면 점령 확률이 100%인 미점령 영지만 자동 점령됩니다.</span></li>
            </ol>
            <div className="conquest-game-probability">
              <h4>점령 확률</h4>
              <div><span>견제 없음</span><strong>100%</strong></div>
              <div><span>적국 1개국 인접</span><strong>50%</strong></div>
              <div><span>적국 2개국 인접</span><strong>25%</strong></div>
              <p>⭐ 27번 보유 시 위 확률에 <b>+5%p</b>가 적용됩니다.</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
