import Image from "next/image";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
  title: "감컴퍼니 삼국지서버",
  description: "감컴퍼니 삼국지서버"
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen md:pl-64">
          <div className="site-chrome-bg hidden border-b border-[var(--border)] px-6 md:flex" style={{ height: "var(--desktop-header-height)" }}>
            <div className="grid w-full grid-cols-[160px_minmax(0,1fr)_160px] items-center gap-4 overflow-hidden">
              <div />

              <div className="flex h-full items-center justify-center overflow-hidden">
                <Image
                  src="/assets/gamst-three-kingdoms-banner-source.webp"
                  alt="감컴퍼니 삼국지서버"
                  width={2048}
                  height={749}
                  priority
                  className="site-header-image"
                />
              </div>

              <div />
            </div>
          </div>

          <SiteNavbar />

          <div className="flex min-h-screen flex-col pt-14 md:pt-6">
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </div>
      </body>
      <SpeedInsights />
    </html>
  );
}
