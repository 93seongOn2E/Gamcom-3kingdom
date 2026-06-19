import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNavbar } from "@/components/SiteNavbar";

export const metadata: Metadata = {
  title: "Minecraft 삼국지 Wiki",
  description: "Minecraft 삼국지 Wiki와 영토 관리자"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen md:pl-64">
          <SiteNavbar />
          <div className="flex min-h-screen flex-col pt-14 md:pt-0">
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </div>
      </body>
    </html>
  );
}
