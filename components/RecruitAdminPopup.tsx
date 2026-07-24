"use client";

import { ExternalLink } from "lucide-react";

const contactUrl = "https://note.sooplive.com/app/index.php?page=write&id_list=lsw5332";

export function RecruitAdminPopup() {
  const openContactPopup = () => {
    window.open(
      contactUrl,
      "soop-contact",
      "popup=yes,width=449,height=546,resizable=yes,scrollbars=yes"
    );
  };

  return (
    <div className="recruit-notice-bar" role="region" aria-label="관리자 모집 공지">
      <div className="recruit-notice-inner">
        <div className="recruit-notice-copy">
          <span className="recruit-notice-badge">관리자 모집</span>
          <span className="recruit-notice-title">위나라 · 촉나라 · 오나라 장비현황 업데이트를 도와주실 분을 모집합니다.</span>
          <span className="recruit-notice-desc">담당 희망 크루를 적어 문의해주세요.</span>
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
