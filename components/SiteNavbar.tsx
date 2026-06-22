"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Monitor, Home, Menu, Radio, ScrollText, Swords, X } from "lucide-react";
import { useEffect, useState } from "react";

const baseNavItems = [
  { href: "/", label: "홈", icon: Home },
  { href: "/factions", label: "세력", icon: Swords },
  { href: "/broadcast", label: "지통실", icon: Radio },
  { href: "/multiview", label: "멀티뷰", icon: Monitor }
];

function SidebarContent({ pathname, onNavigate, adminAuthenticated }: { pathname: string; onNavigate?: () => void; adminAuthenticated: boolean }) {
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);
  const navItems = [
    ...baseNavItems,
    adminAuthenticated
      ? { href: "/admin/map", label: "관리자", icon: ScrollText }
      : { href: "/admin/login", label: "관리자", icon: ScrollText }
  ];

  return (
    <>
      <Link href="/" onClick={onNavigate} className="block px-5 py-5">
        <Image
          src="/assets/gamst-company-logo-aside.png"
          alt="삼국지 Gamst Company"
          width={1400}
          height={1122}
          priority
          className="mx-auto h-auto w-[86.5%]"
        />
      </Link>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-5" aria-label="주 메뉴">
        {navItems.map((item, index) => {
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
        GAMST COMPANY<br />THREE KINGDOMS WIKI
      </div>
    </>
  );
}

export function SiteNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
      <aside className="site-chrome-bg fixed inset-y-0 left-0 z-50 hidden w-64 flex-col md:flex">
        <SidebarContent pathname={pathname} adminAuthenticated={adminAuthenticated} />
      </aside>

      {adminAuthenticated ? (
        <form action="/api/admin/logout" method="post" className="fixed right-6 top-[calc((var(--desktop-header-height)-40px)/2)] z-50 hidden md:block">
          <button
            type="submit"
            className="rounded-lg border border-[rgba(212,167,86,0.28)] bg-[#111111] px-4 py-2 text-sm font-bold text-[#f3e7d0] transition hover:bg-[#1a1a1a]"
          >
            로그아웃
          </button>
        </form>
      ) : null}

      <header className="site-chrome-bg fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-[var(--border)] px-4 md:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/assets/gamst-three-kingdoms-banner-source.webp" alt="감컴퍼니 삼국지서버" width={2048} height={749} className="h-9 w-auto object-contain" priority />
          <span className="text-sm font-bold text-[#f4e0bc]">감컴퍼니 삼국지서버</span>
        </Link>
        <button type="button" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center text-[#f0c98b]" aria-label="메뉴 열기">
          <Menu size={22} />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button type="button" className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} aria-label="메뉴 닫기" />
          <aside className="site-chrome-bg relative flex h-full w-[min(82vw,280px)] flex-col shadow-2xl">
            <button type="button" onClick={() => setOpen(false)} className="absolute right-2 top-2 z-10 grid h-10 w-10 place-items-center text-[#f0c98b]" aria-label="메뉴 닫기">
              <X size={21} />
            </button>
            <SidebarContent pathname={pathname} onNavigate={() => setOpen(false)} adminAuthenticated={adminAuthenticated} />
          </aside>
        </div>
      )}
    </>
  );
}
