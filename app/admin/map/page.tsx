import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminMapEditor } from "@/components/AdminMapEditor";
import { AdminSectionNav } from "@/components/AdminSectionNav";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";

export default async function AdminMapPage() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

  if (!session) {
    redirect("/admin/login");
  }

  if (session.role !== "master") {
    redirect("/admin/factions");
  }

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6">
      <div className="mb-4">
        <div className="mb-2 text-xs font-bold tracking-[0.24em] text-[var(--accent)]">ADMIN</div>
        <div>
          <h1 className="text-2xl font-black text-[#f3e7d0]">영토 지도 관리자</h1>
          <p className="mt-1 text-sm text-[#aa9a82]">
            1번부터 60번까지 지역의 점령 세력을 편집합니다.
          </p>
        </div>
      </div>
      <AdminSectionNav role={session.role} />
      <AdminMapEditor />
    </div>
  );
}
