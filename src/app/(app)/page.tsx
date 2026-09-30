import { deleteMeeting } from "@/actions/meetings";
import { formatMeetingDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function MeetingsPage() {
  const meetings = await prisma.meeting.findMany({
    orderBy: [{ date: "desc" }, { startTime: "desc" }],
    include: { createdBy: { select: { name: true, username: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">الاجتماعات</h1>
          <p className="mt-1 text-sm text-muted">سجل المجالس والمشاركين</p>
        </div>
        <Link
          href="/meetings/new"
          className="bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:bg-neutral-800"
        >
          اجتماع جديد
        </Link>
      </div>

      {meetings.length === 0 ? (
        <p className="border border-dashed border-border px-4 py-12 text-center text-muted">
          لا توجد اجتماعات بعد.
        </p>
      ) : (
        <ul className="divide-y divide-border border border-border">
          {meetings.map((meeting) => (
            <li key={meeting.id} className="px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="font-medium">
                    {formatMeetingDate(meeting.date)}
                  </p>
                  <p className="text-sm text-muted tabular-nums">
                    {meeting.startTime} — {meeting.endTime}
                  </p>
                  {meeting.participants.length > 0 ? (
                    <p className="text-sm">
                      <span className="text-muted">المشاركون: </span>
                      {meeting.participants.join("، ")}
                    </p>
                  ) : null}
                  {meeting.notes ? (
                    <p className="text-sm whitespace-pre-wrap text-muted">
                      {meeting.notes}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/meetings/${meeting.id}/edit`}
                    className="border border-border px-3 py-1.5 text-sm transition hover:bg-surface"
                  >
                    تعديل
                  </Link>
                  <form action={deleteMeeting.bind(null, meeting.id)}>
                    <button
                      type="submit"
                      className="border border-border px-3 py-1.5 text-sm transition hover:bg-surface"
                    >
                      حذف
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
