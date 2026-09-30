type MeetingFormProps = {
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
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
  defaultValues,
}: MeetingFormProps) {
  return (
    <form action={action} className="flex flex-col gap-5">
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
            defaultValue={defaultValues?.startTime}
            className="border border-border bg-background px-3 py-2 tabular-nums outline-none focus:border-foreground"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">وقت النهاية</span>
          <input
            type="time"
            name="endTime"
            required
            defaultValue={defaultValues?.endTime}
            className="border border-border bg-background px-3 py-2 tabular-nums outline-none focus:border-foreground"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">المشاركون</span>
        <textarea
          name="participants"
          rows={3}
          placeholder="اسم لكل سطر أو مفصول بفاصلة"
          defaultValue={defaultValues?.participants?.join("\n")}
          className="resize-y border border-border bg-background px-3 py-2 outline-none focus:border-foreground"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">ملاحظات</span>
        <textarea
          name="notes"
          rows={4}
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
