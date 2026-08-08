"use client";

import { ExternalLink } from "lucide-react";

const contactUrl = "https://note.sooplive.com/app/index.php?page=write&id_list=lsw5332";
const reportUrl = "https://www.sooplive.com/station/kimjony/post/203105201";

export function RecruitAdminPopup() {
  const openContactPopup = () => {
    window.open(
      contactUrl,
      "soop-contact",
      "popup=yes,width=449,height=546,resizable=yes,scrollbars=yes"
    );
  };

  return (
    <div className="recruit-notice-bar" role="region" aria-label="시즌 1 우승 및 관리자 모집 공지">
      <div className="season-one-champion-notice">
        <span aria-hidden="true">🏆</span>
        <strong>삼국지서버 시즌 1</strong>
        <span className="season-one-champion-nation">오나라</span>
        <span className="season-one-champion-names">지권 · 홍사자 · 황원태</span>
        <b>삼국통일을 축하합니다!</b>
      </div>
      <div className="recruit-notice-inner">
        <div className="recruit-notice-copy">
          <span className="recruit-notice-badge">관리자 모집</span>
          <span className="recruit-notice-title">
            <strong className="recruit-notice-nation recruit-notice-nation-wei">위나라</strong>
            <span aria-hidden="true"> · </span>
            <strong className="recruit-notice-nation recruit-notice-nation-wu">꿈나라</strong>
            <span> 장비현황 업데이트를 도와주실 분을 모집합니다.</span>
          </span>
          <span className="recruit-notice-report-group">
            <span className="recruit-notice-desc">위나라 · 꿈나라 내실 현황 제보 부탁드립니다.</span>
            <a
              href={reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="recruit-notice-report-button"
            >
              제보하기
              <ExternalLink size={13} />
            </a>
            <small className="recruit-notice-aside">하... ㅈ댔네...</small>
          </span>
        </div>

        <div className="recruit-notice-actions">
          <button type="button" onClick={openContactPopup} className="recruit-popup-primary">
            문의하기
            <ExternalLink size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
