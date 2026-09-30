import { AdminToggle } from "@/components/admin-toggle";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export default async function AdminsPage() {
  const current = await requireAdmin();
  const users = await prisma.user.findMany({
    orderBy: [{ isAdmin: "desc" }, { createdAt: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">المشرفون</h1>
        <p className="mt-1 text-sm text-muted">
          منح أو إزالة صلاحية الإشراف للمستخدمين الذين سجّلوا الدخول.
        </p>
      </div>

      {users.length === 0 ? (
        <p className="border border-dashed border-border px-4 py-12 text-center text-muted">
          لا يوجد مستخدمون بعد.
        </p>
      ) : (
        <ul className="divide-y divide-border border border-border">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5"
            >
              <div>
                <p className="font-medium">{user.name ?? "بدون اسم"}</p>
                <p className="text-sm text-muted">
                  {user.username ? `@${user.username}` : user.id}
                  {user.isAdmin ? " · مشرف" : ""}
                  {user.id === current.id ? " · أنت" : ""}
                </p>
              </div>
              <AdminToggle
                userId={user.id}
                isAdmin={user.isAdmin}
                disabled={user.id === current.id}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
