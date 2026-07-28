import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock3, KeyRound, MapPinned, ScrollText, ShieldCheck, Swords } from "lucide-react";
import { AdminSectionNav } from "@/components/AdminSectionNav";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";

const workflowSteps = [
  {
    title: "정보 확인",
    description: "방송 내용, 담당 크루, 현재 페이지 상태를 기준으로 수정할 내용을 먼저 확인합니다."
  },
  {
    title: "관리자 입력",
    description: "장비현황 또는 연대기 메뉴에서 필요한 항목만 수정하거나 추가합니다."
  },
  {
    title: "검수 및 반영",
    description: "연대기는 마스터 승인 후 메인 화면에 반영됩니다. 장비현황은 저장 후 공개 페이지에 반영됩니다."
  }
];

const guideSections = [
  {
    title: "장비현황",
    href: "/admin/factions",
    icon: Swords,
    access: "모든 관리자",
    summary: "멤버별 직업과 장비 수치를 관리합니다.",
    checklist: [
      "직업, 말, 무기, 두갑, 흉갑, 각갑과 무력·기민·기력·지모 값을 최신 기준으로 입력합니다.",
      "장비 수치는 0 이상의 정수만 입력합니다.",
      "담당 크루 외 정보는 확실한 경우에만 수정합니다."
    ],
    caution: "저장 즉시 공개 장비현황 페이지에 반영됩니다."
  },
  {
    title: "연대기",
    href: "/admin/chronicle",
    icon: ScrollText,
    access: "모든 관리자",
    summary: "전투, 공성, 주요 사건을 시간순 기록으로 정리합니다.",
    checklist: [
      "발생일, 관련 국가, 내용을 빠짐없이 입력합니다.",
      "내용은 짧고 명확하게 작성합니다.",
      "일반 관리자가 추가한 항목은 승인 대기로 등록됩니다."
    ],
    caution: "메인 화면 반영은 마스터 승인 후 진행됩니다."
  },
  {
    title: "영토",
    href: "/admin/map",
    icon: MapPinned,
    access: "마스터 관리자",
    summary: "지도에 표시되는 성 정보와 점령 세력을 관리합니다.",
    checklist: [
      "성 이름, 등급, 위치, 점령 세력을 수정합니다.",
      "지도 배치는 시청자가 보기 좋은 구성을 우선합니다.",
      "변경 후 메인 지도에서 위치와 라벨이 어색하지 않은지 확인합니다."
    ],
    caution: "일반 관리자에게는 메뉴가 표시되지 않습니다."
  },
  {
    title: "비밀번호 변경",
    href: "/admin/password",
    icon: KeyRound,
    access: "모든 관리자",
    summary: "현재 로그인한 관리자 계정의 비밀번호를 변경합니다.",
    checklist: [
      "본인 계정의 비밀번호만 변경합니다.",
      "운영 중 공유 계정 사용은 피하고 개인 계정을 사용합니다.",
      "비밀번호는 원문이 아닌 암호화된 값으로 안전하게 저장됩니다."
    ],
    caution: "비밀번호는 다른 사이트와 다르게 설정하는 것을 권장합니다."
  }
];

export default async function AdminGuidePage() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 font-['Noto_Sans_KR','Malgun_Gothic',sans-serif]">
      <div className="mb-4">
        <div className="mb-2 text-xs font-bold tracking-[0.24em] text-[var(--accent)]">ADMIN</div>
        <h1 className="text-2xl font-black text-[#f3e7d0]">관리자 가이드</h1>
        <p className="mt-1 text-sm leading-6 text-[#aa9a82]">
          관리자가 어떤 메뉴에서 무엇을 수정해야 하는지 빠르게 확인하는 안내 페이지입니다.
        </p>
      </div>

      <AdminSectionNav role={session.role} />

      <section className="pixel-frame mb-5 overflow-hidden p-5 md:p-6">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[rgba(212,167,86,0.24)] bg-white/5 px-3 py-1 text-xs font-bold text-[#f0c98b]">
            <ShieldCheck size={14} />
            현재 권한: {session.role === "master" ? "마스터 관리자" : "일반 관리자"}
          </div>
          <h2 className="text-xl font-black text-[#f3e7d0]">운영 기준</h2>
          <p className="mt-2 text-sm leading-7 text-[#d7c5a4]">
            장비현황은 최신 기준으로 정확하게 입력하고, 연대기는 시청자가 흐름을 이해하기 쉽게 짧고 명확하게 정리합니다.
            공개 화면에 바로 영향을 주는 항목은 저장 전 한 번 더 확인해주세요.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <div key={step.title} className="rounded-xl border border-[rgba(212,167,86,0.16)] bg-black/20 p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-black text-[#f0c98b]">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--accent)] text-xs text-[#1a130d]">{index + 1}</span>
                  {step.title}
                </div>
                <p className="text-xs leading-5 text-[#bfae91]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {guideSections.map((section) => {
          const Icon = section.icon;
          const disabled = section.href === "/admin/map" && session.role !== "master";

          return (
            <article key={section.href} className="pixel-frame overflow-hidden p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[rgba(212,167,86,0.2)] bg-white/5 text-[#f0c98b]">
                    <Icon size={21} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-[#f3e7d0]">{section.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-[#cdb487]">{section.summary}</p>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center justify-center rounded-full border border-[rgba(212,167,86,0.22)] bg-white/5 px-3 py-1 text-xs font-bold text-[#dbc292]">
                  {section.access}
                </span>
              </div>

              <div className="mt-4 rounded-xl border border-[rgba(212,167,86,0.14)] bg-black/20 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-black text-[#f0c98b]">
                  <CheckCircle2 size={16} />
                  확인할 것
                </div>
                <ul className="grid gap-2 text-sm leading-6 text-[#d9c7a5]">
                  {section.checklist.map((note) => (
                    <li key={note} className="flex gap-2">
                      <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2 text-sm leading-6 text-[#cdb487]">
                  <Clock3 className="shrink-0 text-[#f0c98b]" size={16} />
                  {section.caution}
                </p>
                <Link
                  href={disabled ? "/admin/guide" : section.href}
                  aria-disabled={disabled}
                  className={`inline-flex h-10 shrink-0 items-center justify-center rounded-lg px-4 text-sm font-black transition ${
                    disabled
                      ? "cursor-not-allowed border border-white/10 bg-white/5 text-[#7f6f58]"
                      : "bg-[var(--accent)] text-[#1a130d] hover:brightness-110"
                  }`}
                >
                  {disabled ? "마스터 권한 필요" : `${section.title} 바로가기`}
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
