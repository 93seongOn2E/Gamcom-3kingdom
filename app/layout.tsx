import Image from "next/image";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import "./globals.css";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNavbar } from "@/components/SiteNavbar";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Minecraft 삼국지 Wiki",
  description: "Minecraft 삼국지 Wiki와 영토 관리자"
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen md:pl-64">
          <div className="site-chrome-bg hidden border-b border-[var(--border)] px-6 md:flex" style={{ height: "var(--desktop-header-height)" }}>
            <div className="grid w-full grid-cols-[160px_minmax(0,1fr)_160px] items-center gap-4 overflow-hidden">
              <div />

              <div className="flex h-full items-center justify-center overflow-hidden">
                <Image
                  src="/assets/gamst-three-kingdoms-banner-source.png"
                  alt="감컴퍼니 삼국지서버"
                  width={2048}
                  height={749}
                  priority
                  className="site-header-image"
                />
              </div>

              <div className="flex items-center justify-end">
                {session ? (
                  <form action="/api/admin/logout" method="post">
                    <button
                      type="submit"
                      className="rounded-lg border border-[rgba(212,167,86,0.28)] bg-[#111111] px-4 py-2 text-sm font-bold text-[#f3e7d0] transition hover:bg-[#1a1a1a]"
                    >
                      로그아웃
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          </div>

          <SiteNavbar />

          <div className="flex min-h-screen flex-col pt-14 md:pt-6">
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </div>
      </body>
    </html>
  );
}
