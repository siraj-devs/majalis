import { LoginButton } from "@/components/login-button";
import { getCurrentUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_request: "بيانات تسجيل الدخول غير مكتملة. حاول مرة أخرى.",
  invalid_state: "انتهت صلاحية جلسة الدخول. حاول مرة أخرى.",
  authentication_failed: "فشل تسجيل الدخول. حاول مرة أخرى.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.isAdmin ? "/" : "/unauthorized");
  }

  const { error } = await searchParams;
  const errorMessage = error
    ? (ERROR_MESSAGES[error] ?? "حدث خطأ غير متوقع.")
    : null;

  return (
    <main className="relative flex min-h-full flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,#fafafa_100%),repeating-linear-gradient(90deg,transparent,transparent_47px,#e5e5e5_47px,#e5e5e5_48px)] opacity-60"
      />
      <div className="relative flex w-full max-w-md flex-col items-center gap-8">
        <div className="fade-up text-center">
          <h1 className="text-6xl font-bold tracking-tight text-foreground">
            مجالس
          </h1>
          <p className="fade-up fade-delay-1 mt-3 text-muted">
            سجّل الدخول لإدارة سجل المجالس.
          </p>
        </div>

        {errorMessage ? (
          <p className="border border-foreground px-4 py-2 text-sm">
            {errorMessage}
          </p>
        ) : null}

        <div className="fade-up fade-delay-2 flex w-full justify-center">
          <LoginButton />
        </div>
      </div>
    </main>
  );
}
