"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

const hiddenKey = "gc-equipment-update-notice-hidden";

export function EquipmentUpdateNoticeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(hiddenKey) !== "1") {
      setOpen(true);
    }
  }, []);

  function close() {
    setOpen(false);
  }

  function closeForever() {
    window.localStorage.setItem(hiddenKey, "1");
    setOpen(false);
  }

  if (!open) {
    return null;
  }

  return (
    <div className="equipment-update-modal-layer">
      <section className="equipment-update-modal" role="dialog" aria-modal="true" aria-labelledby="equipment-update-modal-title">
        <button type="button" className="equipment-update-modal-close" onClick={close} aria-label="공지 닫기">
          <X size={18} />
        </button>

        <p className="equipment-update-modal-eyebrow">공지</p>
        <h2 id="equipment-update-modal-title">장비현황 업데이트 로직 안내</h2>

        <div className="equipment-update-modal-copy">
          <p>
            위나라 오나라 내실 업데이트 부탁한다는 쪽지만 오는데<br />
            제보를 해주셔야 빠른 반영이 가능 합니다.
          </p>
          <p>
            촉나라는 매니저님이 시트지 권한을 가지고 있어 직접 업데이트를 해주시지만,<br />
            오나라 · 위나라는 책사들 방송을 제가 구플 결제후<br />
            시트지를 열어본적이있나 직접 찾아서 시트지 보고업데이트중입니다.
          </p>
          <p>
            해당 국가에서 시트지를 방송에 아예 노출하지 않거나,<br />
            업데이트되지 않은 시트지가 노출된 경우에는<br />
            위나라 · 오나라 내실 업데이트가 어렵습니다.
          </p>
        </div>

        <div className="equipment-update-modal-actions">
          <button type="button" className="equipment-update-modal-secondary" onClick={closeForever}>
            다시 보지 않기
          </button>
          <button type="button" className="equipment-update-modal-primary" onClick={close}>
            확인
          </button>
        </div>
      </section>
    </div>
  );
}
