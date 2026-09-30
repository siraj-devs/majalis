import { updateMeeting } from "@/actions/meetings";
import { MeetingForm } from "@/components/meeting-form";
import { toDateInputValue } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditMeetingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meeting = await prisma.meeting.findUnique({ where: { id } });
  if (!meeting) notFound();

  const action = updateMeeting.bind(null, meeting.id);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">تعديل الاجتماع</h1>
        <Link
          href="/"
          className="text-sm text-muted transition hover:text-foreground"
        >
          رجوع
        </Link>
      </div>
      <MeetingForm
        action={action}
        submitLabel="حفظ التعديلات"
        defaultValues={{
          date: toDateInputValue(meeting.date),
          startTime: meeting.startTime,
          endTime: meeting.endTime,
          notes: meeting.notes,
          participants: meeting.participants,
        }}
      />
    </div>
  );
}
