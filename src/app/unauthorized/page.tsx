import { logout } from "@/actions/auth";
import { getCurrentAuth } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export default async function UnauthorizedPage() {
  const auth = await getCurrentAuth();
  if (!auth) redirect("/login");
  if (auth.user?.role === "admin" && !auth.user.isBlocked) redirect("/");

  const pendingAccount = !auth.user;
  const blocked = Boolean(auth.user?.isBlocked);

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <h1 className="text-5xl font-bold tracking-tight">مجالس</h1>
        <div className="space-y-2">
          <p className="text-xl font-medium">
            {blocked ? "الحساب محظور" : pendingAccount ? "بانتظار الربط" : "لا صلاحية"}
          </p>
          <p className="text-muted">
            {blocked
              ? "تم حظر حسابك. تواصل مع مشرف إن كنت تعتقد أن هذا خطأ."
              : pendingAccount
                ? "تم تسجيل دخولك عبر تيليغرام، لكن لم يُنشأ حسابك بعد. تواصل مع مشرف لربط حسابك."
                : "حسابك مربوط، لكنك لست مشرفًا. تواصل مع مشرف لمنحك الصلاحية."}
          </p>
          <p className="text-sm text-muted">@{auth.connectionUsername}</p>
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
