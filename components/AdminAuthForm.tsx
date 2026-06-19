"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function AdminAuthForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(typeof data.message === "string" ? data.message : "요청을 처리하지 못했습니다.");
        return;
      }

      router.push("/admin/map");
      router.refresh();
    } catch {
      setMessage("관리자 로그인 요청에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="pixel-frame mx-auto grid w-full max-w-md gap-4 p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-black text-[#f3e7d0]">관리자 로그인</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          관리자 계정으로 로그인해야 관리자 메뉴를 사용할 수 있습니다.
        </p>
      </div>

      <label className="grid gap-2 text-sm font-bold text-[#f3e7d0]">
        아이디
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="h-11 rounded-lg border border-[var(--border)] bg-black/50 px-3 text-[#f3e7d0] outline-none"
          placeholder="admin"
          autoComplete="username"
          required
        />
      </label>

      <label className="grid gap-2 text-sm font-bold text-[#f3e7d0]">
        비밀번호
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-11 rounded-lg border border-[var(--border)] bg-black/50 px-3 text-[#f3e7d0] outline-none"
          autoComplete="current-password"
          required
        />
      </label>

      {message ? <p className="text-sm font-bold text-[#ffb0a8]">{message}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="admin-capture h-12 rounded-lg disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "처리 중..." : "로그인"}
      </button>
    </form>
  );
}
