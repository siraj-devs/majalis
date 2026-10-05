import { UsersAdmin } from "@/components/users-admin";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export default async function AdminsPage() {
  const current = await requireAdmin();

  const [pendingConnections, users] = await Promise.all([
    prisma.connection.findMany({
      where: { userId: null },
      orderBy: { accessedAt: "desc" },
      select: {
        id: true,
        name: true,
        username: true,
      },
    }),
    prisma.user.findMany({
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
      include: {
        connections: {
          select: { id: true, username: true, name: true },
        },
      },
    }),
  ]);

  return (
    <UsersAdmin
      currentUserId={current.id}
      pendingConnections={pendingConnections}
      users={users}
    />
  );
}
