"use client";

import { createMeeting, deleteMeeting, updateMeeting } from "@/actions/meetings";
import { MeetingForm } from "@/components/meeting-form";
import type { AdminOption } from "@/components/participants-field";
import { formatMeetingDate, toDateInputValue } from "@/lib/format";
import {
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState, useTransition } from "react";

export type MeetingListItem = {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  notes: string | null;
  participants: string[];
};

type MeetingsUiProps = {
  meetings: MeetingListItem[];
  admins: AdminOption[];
};

type ModalMode =
  | { type: "create" }
  | { type: "edit"; meeting: MeetingListItem }
  | { type: "delete"; meeting: MeetingListItem }
  | null;

export function MeetingsUi({ meetings, admins }: MeetingsUiProps) {
  const [modal, setModal] = useState<ModalMode>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [deletePending, startDeleteTransition] = useTransition();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (modal) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [modal]);

  function closeModal() {
    setModal(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">المجالس</h1>
          <p className="mt-1 text-sm text-muted">سجل المجالس والحضور</p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ type: "create" })}
          className="inline-flex items-center gap-2 bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:bg-neutral-800"
        >
          <PlusIcon weight="bold" className="size-4" />
          مجلس جديد
        </button>
      </div>

      {meetings.length === 0 ? (
        <p className="border border-dashed border-border px-4 py-12 text-center text-muted">
          لا توجد مجالس بعد.
        </p>
      ) : (
        <ul className="divide-y divide-border border border-border">
          {meetings.map((meeting) => (
            <li key={meeting.id} className="px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {formatMeetingDate(meeting.date)}
                    </p>
                    <p className="text-sm text-muted tabular-nums">
                      {meeting.startTime} — {meeting.endTime}
                    </p>
                  </div>
                  {meeting.participants.length > 0 ? (
                    <ul className="flex flex-wrap gap-1.5">
                      {meeting.participants.map((name) => (
                        <li
                          key={name}
                          className="border border-border px-2 py-0.5 text-xs"
                        >
                          {name}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {meeting.notes ? (
                    <p className="text-sm whitespace-pre-wrap text-muted">
                      {meeting.notes}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setModal({ type: "edit", meeting })}
                    aria-label="تعديل"
                    className="p-2 text-muted transition hover:bg-surface hover:text-foreground"
                  >
                    <PencilSimpleIcon className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setModal({ type: "delete", meeting })}
                    aria-label="حذف"
                    className="p-2 text-muted transition hover:bg-surface hover:text-foreground"
                  >
                    <TrashIcon className="size-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        onClose={closeModal}
        className="m-auto w-[calc(100%-2rem)] max-w-lg border border-border bg-background p-0 text-foreground shadow-lg backdrop:bg-black/40 open:flex open:flex-col"
      >
        {modal?.type === "delete" ? (
          <>
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-lg font-bold">تأكيد الحذف</h2>
              <button
                type="button"
                onClick={closeModal}
                aria-label="إغلاق"
                className="p-1.5 text-muted transition hover:text-foreground"
              >
                <XIcon className="size-5" />
              </button>
            </div>
            <div className="space-y-5 px-5 py-5">
              <p className="text-sm text-muted">
                هل تريد حذف مجلس{" "}
                <span className="font-medium text-foreground">
                  {formatMeetingDate(meetingDate(modal.meeting.date))}
                </span>
                ؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={deletePending}
                  className="h-11 flex-1 border border-border px-4 text-sm transition hover:bg-surface disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={deletePending}
                  onClick={() => {
                    startDeleteTransition(async () => {
                      await deleteMeeting(modal.meeting.id);
                      closeModal();
                    });
                  }}
                  className="h-11 flex-1 bg-foreground px-4 text-sm font-semibold text-background transition hover:bg-neutral-800 disabled:opacity-50"
                >
                  {deletePending ? "جارٍ الحذف..." : "حذف"}
                </button>
              </div>
            </div>
          </>
        ) : null}

        {modal?.type === "create" || modal?.type === "edit" ? (
          <>
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-lg font-bold">
                {modal.type === "create" ? "مجلس جديد" : "تعديل المجلس"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                aria-label="إغلاق"
                className="p-1.5 text-muted transition hover:text-foreground"
              >
                <XIcon className="size-5" />
              </button>
            </div>
            <div className="max-h-[80vh] overflow-y-auto px-5 py-5">
              <MeetingForm
                key={modal.type === "edit" ? modal.meeting.id : "create"}
                admins={admins}
                action={async (formData) => {
                  if (modal.type === "create") {
                    await createMeeting(formData);
                  } else {
                    await updateMeeting(modal.meeting.id, formData);
                  }
                  closeModal();
                }}
                submitLabel={
                  modal.type === "create" ? "حفظ المجلس" : "حفظ التعديلات"
                }
                defaultValues={
                  modal.type === "edit"
                    ? {
                        date: toDateInputValue(meetingDate(modal.meeting.date)),
                        startTime: modal.meeting.startTime,
                        endTime: modal.meeting.endTime,
                        notes: modal.meeting.notes,
                        participants: modal.meeting.participants,
                      }
                    : undefined
                }
              />
            </div>
          </>
        ) : null}
      </dialog>
    </div>
  );
}

function meetingDate(date: Date | string): Date {
  return date instanceof Date ? date : new Date(date);
}
