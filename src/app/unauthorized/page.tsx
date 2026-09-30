import { logout } from "@/actions/auth";
import { getCurrentUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export default async function UnauthorizedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.isAdmin) redirect("/");

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <h1 className="text-5xl font-bold tracking-tight">مجالس</h1>
        <div className="space-y-2">
          <p className="text-xl font-medium">لا صلاحية</p>
          <p className="text-muted">
            حسابك مسجّل، لكنك لست مشرفًا. تواصل مع مشرف لمنحك الصلاحية.
          </p>
          {user.username ? (
            <p className="text-sm text-muted">@{user.username}</p>
          ) : null}
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="border border-border px-5 py-2 text-sm transition hover:bg-surface"
          >
            خروج
          </button>
        </form>
      </div>
    </main>
  );
}
