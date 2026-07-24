import { ContactButton } from "@/components/ContactButton";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-[var(--border)]">
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#c0392b] to-transparent" />
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-[#9b8a70]">
        <div>
          <p className="max-w-5xl text-[13px] font-medium leading-7 text-[#d7c5a4] md:text-sm">
            본 사이트는 비영리 팬 사이트이며, 모든 콘텐츠의 저작권은 원저작권자에게 있습니다.
            <br />
            사이트에 표시되는 정보는 편의를 위해 정리한 참고용 자료이며, 실제 서버 내 정보와 다를 수 있습니다.
            <br />
          </p>
          <ContactButton className="mt-4 rounded-lg border border-[rgba(212,167,86,0.35)] bg-[#15120e] px-4 py-2.5 font-bold text-[#f0c98b] transition-colors hover:border-[#d4a756] hover:bg-[#211b13] hover:text-[#fff2df]">
            오류정보 및 개선사항 문의하기
          </ContactButton>
        </div>
      </div>
    </footer>
  );
}
