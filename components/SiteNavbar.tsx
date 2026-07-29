"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, Map, Menu, Monitor, Radio, ScrollText, Swords, Video, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getStreamerMode, setStreamerMode, STREAMER_MODE_EVENT } from "@/lib/streamer-mode";

type NavLinkItem = {
  href: string;
  label: string;
  icon: typeof Home;
};

type NavSeparatorItem = {
  type: "separator";
  label: string;
};

type NavItem = NavLinkItem | NavSeparatorItem;

const baseNavItems: NavLinkItem[] = [
  { href: "/", label: "홈", icon: Home },
  { href: "/simulation", label: "점령 시뮬레이터", icon: Map },
  { href: "/about", label: "티저영상", icon: Video },
  { href: "/jobs", label: "직업소개", icon: BookOpen },
  { href: "/broadcast", label: "지통실", icon: Radio },
  { href: "/multiview", label: "멀티뷰", icon: Monitor }
];

const integratedEquipmentNavItem: NavLinkItem = { href: "/factions", label: "통합 내실현황", icon: Swords };
const nationEquipmentNavItem: NavLinkItem = { href: "/factions/nation", label: "국가별 내실현황", icon: Swords };

function SidebarContent({
  pathname,
  onNavigate,
  adminAuthenticated,
  streamerModeOn,
  onStreamerModeChange
}: {
  pathname: string;
  onNavigate?: () => void;
  adminAuthenticated: boolean;
  streamerModeOn: boolean;
  onStreamerModeChange: () => void;
}) {
  const isActive = (href: string) => {
    if (href === "/" || href === "/factions") {
      return pathname === href;
    }
    if (href === "/factions/nation") {
      return pathname === href || (pathname.startsWith("/factions/") && pathname !== "/factions");
    }
    return pathname.startsWith(href);
  };
  const navItems: NavItem[] = [
    ...baseNavItems,
    nationEquipmentNavItem,
    ...(!streamerModeOn
      ? [
          { type: "separator" as const, label: "-스트리머클릭주의-" },
          integratedEquipmentNavItem
        ]
      : []),
    adminAuthenticated
      ? { href: "/admin/map", label: "관리자", icon: ScrollText }
      : { href: "/admin/login", label: "관리자", icon: ScrollText }
  ];

  return (
    <>
      <Link href="/" onClick={onNavigate} className="block px-5 py-5">
        <Image
          src="/assets/gamst-company-logo-aside.png"
          alt="감컴퍼니 Gamst Company"
          width={1400}
          height={1122}
          priority
          className="mx-auto h-auto w-[86.5%]"
        />
      </Link>

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-5" aria-label="주 메뉴">
        <div className="home-streamer-control sidebar-streamer-control">
          <button
            type="button"
            className={`home-streamer-switch ${streamerModeOn ? "active" : ""}`}
            role="switch"
            aria-checked={streamerModeOn}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onStreamerModeChange();
            }}
          >
            <span className="home-streamer-switch-track" aria-hidden="true">
              <span className="home-streamer-switch-thumb" />
            </span>
            <strong>{streamerModeOn ? "ON" : "OFF"}</strong>
          </button>
          <span className="home-streamer-control-label">스트리머 모드</span>
        </div>

        {navItems.map((item, index) => {
          if (!("href" in item)) {
            return (
              <div key={item.label} className="mb-2 mt-5 flex items-center gap-2 px-3 text-[12px] font-black tracking-[0.12em] text-[#ffd27a] drop-shadow-[0_0_8px_rgba(212,160,23,0.35)]">
                <span className="h-px flex-1 bg-[rgba(255,210,122,0.38)]" />
                <span className="whitespace-nowrap">- 스트리머 클릭주의 -</span>
                <span className="h-px flex-1 bg-[rgba(255,210,122,0.38)]" />
              </div>
            );
          }

          const Icon = item.icon;
          const active = isActive(item.href);
          const isAdmin = item.href.startsWith("/admin");

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`relative flex h-11 items-center gap-3 border-l-2 px-3 text-sm font-bold transition-colors ${
                active
                  ? "border-[var(--accent)] bg-[#d4a017]/10 text-[#f0c98b]"
                  : "border-transparent text-[#cdbb98] hover:bg-white/5 hover:text-[#fff2df]"
              } ${isAdmin && index > 0 ? "mt-auto" : ""}`}
            >
              <Icon size={17} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--border)] px-5 py-4 text-[11px] leading-5 text-[#7f6f58]">
        감컴퍼니 삼국지서버
      </div>
    </>
  );
}

export function SiteNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [streamerModeOn, setStreamerModeOnState] = useState(true);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleStreamerModeChange = (event: Event) => {
      setStreamerModeOnState((event as CustomEvent<boolean>).detail);
    };

    setStreamerModeOnState(getStreamerMode());
    window.addEventListener(STREAMER_MODE_EVENT, handleStreamerModeChange);
    return () => window.removeEventListener(STREAMER_MODE_EVENT, handleStreamerModeChange);
  }, []);

  const toggleStreamerMode = () => {
    const nextStreamerMode = !streamerModeOn;
    setStreamerModeOnState(nextStreamerMode);
    setStreamerMode(nextStreamerMode);
  };

  useEffect(() => {
    let mounted = true;
    const shouldCheckSession = pathname.startsWith("/admin") || document.cookie.includes("gc_admin_hint=1");

    if (!shouldCheckSession) {
      setAdminAuthenticated(false);
      return;
    }

    fetch("/api/admin/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (mounted) {
          setAdminAuthenticated(Boolean(data?.authenticated));
        }
      })
      .catch(() => {
        if (mounted) {
          setAdminAuthenticated(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [pathname]);

  return (
    <>
      <aside className="site-chrome-bg fixed inset-y-0 left-0 z-[200] hidden w-64 flex-col md:flex">
        <SidebarContent
          pathname={pathname}
          adminAuthenticated={adminAuthenticated}
          streamerModeOn={streamerModeOn}
          onStreamerModeChange={toggleStreamerMode}
        />
      </aside>

      {adminAuthenticated ? (
        <form action="/api/admin/logout" method="post" className="absolute right-6 top-[calc((var(--desktop-header-height)-40px)/2)] z-50 hidden md:block">
          <button
            type="submit"
            className="rounded-lg border border-[rgba(212,167,86,0.28)] bg-[#111111] px-4 py-2 text-sm font-bold text-[#f3e7d0] transition hover:bg-[#1a1a1a]"
          >
            로그아웃
          </button>
        </form>
      ) : null}

      <header className="site-chrome-bg fixed inset-x-0 top-0 z-[200] flex h-14 items-center justify-between border-b border-[var(--border)] px-4 md:hidden">
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden">
          <Image src="/assets/gamst-three-kingdoms-banner-source.webp" alt="감컴퍼니 삼국지서버" width={2048} height={749} className="h-9 w-auto object-contain" priority />
          <span className="text-sm font-bold text-[#f4e0bc]">감컴퍼니 삼국지서버</span>
        </Link>
        <button type="button" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center text-[#f0c98b]" aria-label="메뉴 열기">
          <Menu size={22} />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-[210] md:hidden">
          <button type="button" className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} aria-label="메뉴 닫기" />
          <aside className="site-chrome-bg relative z-10 flex h-full w-[min(82vw,280px)] flex-col shadow-2xl">
            <button type="button" onClick={() => setOpen(false)} className="absolute right-2 top-2 z-10 grid h-10 w-10 place-items-center text-[#f0c98b]" aria-label="메뉴 닫기">
              <X size={21} />
            </button>
            <SidebarContent
              pathname={pathname}
              onNavigate={() => setOpen(false)}
              adminAuthenticated={adminAuthenticated}
              streamerModeOn={streamerModeOn}
              onStreamerModeChange={toggleStreamerMode}
            />
          </aside>
        </div>
      )}
    </>
  );
}
