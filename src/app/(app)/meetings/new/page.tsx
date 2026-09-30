import { createMeeting } from "@/actions/meetings";
import { MeetingForm } from "@/components/meeting-form";
import Link from "next/link";

export default function NewMeetingPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">اجتماع جديد</h1>
        <Link
          href="/"
          className="text-sm text-muted transition hover:text-foreground"
        >
          رجوع
        </Link>
      </div>
      <MeetingForm action={createMeeting} submitLabel="حفظ الاجتماع" />
    </div>
  );
}
