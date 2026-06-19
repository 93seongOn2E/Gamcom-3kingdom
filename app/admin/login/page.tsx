import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminAuthForm } from "@/components/AdminAuthForm";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

  if (session) {
    redirect("/admin/map");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <AdminAuthForm />
    </div>
  );
}
