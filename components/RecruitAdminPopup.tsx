"use client";

export function RecruitAdminPopup() {
  return (
    <div className="recruit-notice-bar" role="region" aria-label="시즌별 우승 및 사이트 운영 종료 공지">
      <div className="season-one-champion-notice">
        <span aria-hidden="true">🏆</span>
        <strong>삼국지서버 시즌 1</strong>
        <span className="season-one-champion-nation">오나라</span>
        <span className="season-one-champion-names">지권 · 홍사자 · 황원태</span>
        <b>삼국통일을 축하합니다!</b>
      </div>
      <div className="season-one-champion-notice season-two-champion-notice">
        <span aria-hidden="true">🏆</span>
        <strong>삼국지서버 시즌 2</strong>
        <span className="season-one-champion-nation season-two-champion-nation">촉나라</span>
        <span className="season-one-champion-names">감스트 · 꾸티뉴</span>
        <b>삼국통일을 축하합니다!</b>
      </div>
      <div className="recruit-notice-inner">
        <div className="recruit-notice-copy">
          <span className="recruit-notice-badge">사이트 운영 안내</span>
          <span className="recruit-notice-title">
            해당 사이트는 15일까지 유지 후 폐쇄 예정입니다.
          </span>
          <span className="recruit-notice-report-group">
            <span className="recruit-notice-desc">제보해주신 모든 분들 감사합니다.</span>
            <small className="recruit-notice-aside">개발 및 관리: 욱기 / 관리: 쪼니</small>
          </span>
        </div>
      </div>
    </div>
  );
}
