import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminFactionsEditor } from "@/components/AdminFactionsEditor";
import { AdminSectionNav } from "@/components/AdminSectionNav";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";

export default async function AdminFactionsPage() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 font-['Noto_Sans_KR','Malgun_Gothic',sans-serif]">
      <div className="mb-4">
        <div className="mb-2 text-xs font-bold tracking-[0.24em] text-[var(--accent)]">ADMIN</div>
        <h1 className="text-2xl font-black text-[#f3e7d0]">세력 정보 관리자</h1>
        <p className="mt-1 text-sm text-[#aa9a82]">직업, 말, 장비와 무력·기민·기력·지모 스탯을 직접 편집합니다.</p>
      </div>
      <AdminSectionNav role={session.role} />
      <AdminFactionsEditor />
    </div>
  );
}
