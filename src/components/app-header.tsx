import { logout } from "@/actions/auth";
import Link from "next/link";

type AppHeaderProps = {
  username?: string | null;
};

export function AppHeader({ username }: AppHeaderProps) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            مجالس
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/"
              className="text-muted transition hover:text-foreground"
            >
              المجالس
            </Link>
            <Link
              href="/admins"
              className="text-muted transition hover:text-foreground"
            >
              المشرفون
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {username ? (
            <span className="hidden text-muted sm:inline">@{username}</span>
          ) : null}
          <form action={logout}>
            <button
              type="submit"
              className="border border-border px-3 py-1.5 transition hover:bg-surface"
            >
              خروج
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
