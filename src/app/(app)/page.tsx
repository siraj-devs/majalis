import { MeetingsUi } from "@/components/meetings-ui";
import { prisma } from "@/lib/prisma";

export default async function MeetingsPage() {
  const [meetings, users] = await Promise.all([
    prisma.meeting.findMany({
      orderBy: [{ date: "desc" }, { startTime: "desc" }],
      include: {
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                connections: {
                  select: { username: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    }),
    prisma.user.findMany({
      where: { isBlocked: false },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        role: true,
        connections: {
          select: { username: true },
          take: 1,
        },
      },
    }),
  ]);

  return (
    <MeetingsUi
      meetings={meetings.map((meeting) => ({
        ...meeting,
        attendees: meeting.attendees.map((a) => ({
          userId: a.userId,
          user: {
            id: a.user.id,
            name: a.user.name,
            telegramUsername: a.user.connections[0]?.username ?? null,
          },
        })),
      }))}
      users={users.map((user) => ({
        id: user.id,
        name: user.name,
        role: user.role,
        telegramUsername: user.connections[0]?.username ?? null,
      }))}
    />
  );
}
