import { MeetingsUi } from "@/components/meetings-ui";
import { prisma } from "@/lib/prisma";

export default async function MeetingsPage() {
  const [meetings, admins] = await Promise.all([
    prisma.meeting.findMany({
      orderBy: [{ date: "desc" }, { startTime: "desc" }],
    }),
    prisma.user.findMany({
      where: { isAdmin: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, username: true },
    }),
  ]);

  return <MeetingsUi meetings={meetings} admins={admins} />;
}
