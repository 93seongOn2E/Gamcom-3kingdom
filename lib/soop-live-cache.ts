import "server-only";
import { unstable_cache } from "next/cache";

export type SoopLiveCachedMember = {
  memberId: number;
  nation: string;
  crewName: string;
  nickname: string;
  soopId: string;
  isLive: boolean;
  broadcastNo: number | null;
  broadcastTitle: string | null;
  viewerCount: number;
  thumbnailImageUrl: string | null;
  job: string | null;
};

export type SoopLiveSnapshot = {
  updatedAt: string;
  totalCount: number;
  successCount: number;
  failedCount: number;
  liveCount: number;
  members: SoopLiveCachedMember[];
};

type UpstashGetResponse = {
  result?: string | null;
  error?: string;
};

const DEFAULT_REDIS_KEY = "soop:live-status";
const DEFAULT_CACHE_SECONDS = 60;

function getCacheSeconds() {
  const value = Number(process.env.SOOP_LIVE_CACHE_SECONDS);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : DEFAULT_CACHE_SECONDS;
}

function getRedisConfig() {
  const restUrl = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_READ_ONLY_TOKEN ??
    process.env.KV_REST_API_TOKEN ??
    process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!restUrl || !token) {
    throw new Error("Redis 환경변수(KV_REST_API_URL, KV_REST_API_READ_ONLY_TOKEN 또는 KV_REST_API_TOKEN)가 필요합니다.");
  }

  return {
    restUrl: restUrl.replace(/\/$/, ""),
    token,
    key: process.env.SOOP_LIVE_REDIS_KEY ?? DEFAULT_REDIS_KEY
  };
}

function assertSnapshot(value: unknown): asserts value is SoopLiveSnapshot {
  if (!value || typeof value !== "object") {
    throw new Error("Redis live snapshot 형식이 올바르지 않습니다.");
  }

  const snapshot = value as Partial<SoopLiveSnapshot>;
  if (!Array.isArray(snapshot.members)) {
    throw new Error("Redis live snapshot에 members 배열이 없습니다.");
  }
}

async function loadSoopLiveSnapshot() {
  const { restUrl, token, key } = getRedisConfig();
  const response = await fetch(`${restUrl}/get/${encodeURIComponent(key)}`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Redis 조회 실패: ${response.status}`);
  }

  const payload = (await response.json()) as UpstashGetResponse;
  if (payload.error) {
    throw new Error(`Redis 조회 실패: ${payload.error}`);
  }

  if (!payload.result) {
    return {
      updatedAt: new Date(0).toISOString(),
      totalCount: 0,
      successCount: 0,
      failedCount: 0,
      liveCount: 0,
      members: []
    } satisfies SoopLiveSnapshot;
  }

  const snapshot = JSON.parse(payload.result) as unknown;
  assertSnapshot(snapshot);
  return snapshot;
}

export const getSoopLiveSnapshot = unstable_cache(
  loadSoopLiveSnapshot,
  ["soop-live-snapshot"],
  {
    revalidate: getCacheSeconds()
  }
);
