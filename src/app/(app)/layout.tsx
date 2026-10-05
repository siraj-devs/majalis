import { AppHeader } from "@/components/app-header";
import { requireAdmin } from "@/lib/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <>
      <AppHeader username={user.connectionUsername} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </>
  );
}
