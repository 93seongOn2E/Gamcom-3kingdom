"use client";

import type { ReactNode } from "react";

const contactUrl = "https://note.sooplive.com/app/index.php?page=write&id_list=lsw5332";

type ContactButtonProps = {
  children?: ReactNode;
  className?: string;
};

export function ContactButton({ children = "오류정보 및 개선사항 문의하기", className }: ContactButtonProps) {
  const openContactPopup = () => {
    window.open(
      contactUrl,
      "soop-contact",
      "popup=yes,width=449,height=546,resizable=yes,scrollbars=yes"
    );
  };

  return (
    <button
      type="button"
      onClick={openContactPopup}
      className={className ?? "rounded-lg border border-[rgba(212,167,86,0.35)] bg-[#15120e] px-4 py-2.5 font-bold text-[#f0c98b] transition-colors hover:border-[#d4a756] hover:bg-[#211b13] hover:text-[#fff2df]"}
    >
      {children}
    </button>
  );
}
