"use client";

import {
  ParticipantsField,
  type AdminOption,
} from "@/components/participants-field";
import { earliestEndTime, isEndAfterStart } from "@/lib/time";
import { useMemo, useState } from "react";

type MeetingFormProps = {
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  admins: AdminOption[];
  defaultValues?: {
    date?: string;
    startTime?: string;
    endTime?: string;
    notes?: string | null;
    participants?: string[];
  };
};

export function MeetingForm({
  action,
  submitLabel,
  admins,
  defaultValues,
}: MeetingFormProps) {
  const [startTime, setStartTime] = useState(defaultValues?.startTime ?? "");
  const [endTime, setEndTime] = useState(defaultValues?.endTime ?? "");
  const [timeError, setTimeError] = useState<string | null>(null);

  const endMin = useMemo(
    () => (startTime ? earliestEndTime(startTime) : undefined),
    [startTime],
  );

  return (
    <form
      action={async (formData) => {
        const start = String(formData.get("startTime") ?? "");
        const end = String(formData.get("endTime") ?? "");
        try {
          if (!isEndAfterStart(start, end)) {
            setTimeError("وقت النهاية يجب أن يكون بعد وقت البداية");
            return;
          }
        } catch {
          setTimeError("صيغة الوقت غير صحيحة");
          return;
        }
        setTimeError(null);
        await action(formData);
      }}
      className="flex flex-col gap-5"
    >
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">التاريخ</span>
        <input
          type="date"
          name="date"
          required
          defaultValue={defaultValues?.date}
          className="border border-border bg-background px-3 py-2 tabular-nums outline-none focus:border-foreground"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">وقت البداية</span>
          <input
            type="time"
            name="startTime"
            required
            value={startTime}
            onChange={(e) => {
              const next = e.target.value;
              setStartTime(next);
              setTimeError(null);
              if (endTime) {
                try {
                  if (!isEndAfterStart(next, endTime)) {
                    setEndTime("");
                  }
                } catch {
                  /* ignore while typing */
                }
              }
            }}
            className="border border-border bg-background px-3 py-2 tabular-nums outline-none focus:border-foreground"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">وقت النهاية</span>
          <input
            type="time"
            name="endTime"
            required
            value={endTime}
            min={endMin}
            onChange={(e) => {
              setEndTime(e.target.value);
              setTimeError(null);
            }}
            className="border border-border bg-background px-3 py-2 tabular-nums outline-none focus:border-foreground"
          />
        </label>
      </div>

      {timeError ? <p className="text-sm text-foreground">{timeError}</p> : null}

      <ParticipantsField
        defaultValue={defaultValues?.participants}
        admins={admins}
      />

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">ملاحظات</span>
        <textarea
          name="notes"
          rows={3}
          defaultValue={defaultValues?.notes ?? ""}
          className="resize-y border border-border bg-background px-3 py-2 outline-none focus:border-foreground"
        />
      </label>

      <button
        type="submit"
        className="h-11 bg-foreground px-6 text-sm font-semibold text-background transition hover:bg-neutral-800"
      >
        {submitLabel}
      </button>
    </form>
  );
}
