import Link from "next/link";
import type { ThreeKingdomSeason } from "@/lib/season";

export function SeasonTabs({
  activeSeason,
  pathname,
  compact = false
}: {
  activeSeason: ThreeKingdomSeason;
  pathname: string;
  compact?: boolean;
}) {
  return (
    <nav className={`season-tabs ${compact ? "sidebar-season-tabs" : ""}`} aria-label="삼국지 시즌 선택">
      {([1, 2] as const).map((season) => (
        <Link
          key={season}
          href={`${pathname}?season=${season}`}
          className={activeSeason === season ? "active" : ""}
          aria-current={activeSeason === season ? "page" : undefined}
        >
          <span>삼국지</span>
          <strong>시즌 {season}</strong>
          {season === 1 ? <small>지난 기록</small> : <small>현재 시즌</small>}
        </Link>
      ))}
    </nav>
  );
}
