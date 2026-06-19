export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-[var(--border)]">
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#c0392b] to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm text-[#9b8a70] md:grid-cols-3">
        <div>
          <div className="mb-2 font-bold tracking-wide text-[var(--accent)]">Minecraft 삼국지 Wiki</div>
          <p className="leading-7">삼국지 세계관을 Minecraft 서버 운영에 맞게 정리하는 Wiki와 관리자 도구입니다.</p>
        </div>
        <div>
          <div className="mb-2 font-semibold text-[#e8d5b0]">메뉴</div>
          <p className="leading-7">장수 · 세력 · 아이템 · 가이드 · 관리자</p>
        </div>
        <div>
          <div className="mb-2 font-semibold text-[#e8d5b0]">관리</div>
          <p className="leading-7">영토 지도, 성 레벨, 영역 배율, 위치 정보를 Neon DB와 연동해 관리합니다.</p>
        </div>
      </div>
    </footer>
  );
}
