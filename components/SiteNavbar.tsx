"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, Menu, Package, ScrollText, Shield, Swords, X } from "lucide-react";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/", label: "홈", icon: Home },
  { href: "/heroes", label: "장수", icon: Swords },
  { href: "/factions", label: "세력", icon: Shield },
  { href: "/items", label: "아이템", icon: Package },
  { href: "/guide", label: "가이드", icon: BookOpen },
  { href: "/admin/map", label: "관리자", icon: ScrollText }
];

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <Link href="/" onClick={onNavigate} className="block border-b border-[var(--border)] px-5 py-5">
        <Image
          src="/assets/gamst-company-logo.png"
          alt="삼국지 Gamst Company"
          width={1400}
          height={1122}
          priority
          className="h-auto w-full"
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

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-[var(--border)] bg-black md:flex">
        <SidebarContent pathname={pathname} />
      </aside>

      <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-[var(--border)] bg-black/95 px-4 backdrop-blur-sm md:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/assets/gamst-company-logo.png" alt="삼국지" width={48} height={38} className="h-9 w-11 object-cover" priority />
          <span className="text-sm font-bold text-[#f4e0bc]">삼국지 Wiki</span>
        </Link>
        <button type="button" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center text-[#f0c98b]" aria-label="메뉴 열기">
          <Menu size={22} />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button type="button" className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} aria-label="메뉴 닫기" />
          <aside className="relative flex h-full w-[min(82vw,280px)] flex-col border-r border-[var(--border)] bg-black shadow-2xl">
            <button type="button" onClick={() => setOpen(false)} className="absolute right-2 top-2 z-10 grid h-10 w-10 place-items-center text-[#f0c98b]" aria-label="메뉴 닫기">
              <X size={21} />
            </button>
            <SidebarContent pathname={pathname} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
