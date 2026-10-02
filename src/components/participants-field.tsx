"use client";

import { PlusIcon, XIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";

export type AdminOption = {
  id: string;
  name: string | null;
  username: string | null;
};

type ParticipantsFieldProps = {
  defaultValue?: string[];
  admins: AdminOption[];
};

function adminLabel(admin: AdminOption): string {
  if (admin.name?.trim()) return admin.name.trim();
  if (admin.username) return `@${admin.username}`;
  return admin.id;
}

export function ParticipantsField({
  defaultValue = [],
  admins,
}: ParticipantsFieldProps) {
  const [participants, setParticipants] = useState<string[]>(defaultValue);
  const [draft, setDraft] = useState("");

  const selectedSet = useMemo(
    () => new Set(participants.map((p) => p.trim())),
    [participants],
  );

  function addParticipant(name: string) {
    const value = name.trim();
    if (!value || selectedSet.has(value)) return;
    setParticipants((prev) => [...prev, value]);
  }

  function removeParticipant(name: string) {
    setParticipants((prev) => prev.filter((p) => p !== name));
  }

  function toggleAdmin(admin: AdminOption) {
    const label = adminLabel(admin);
    if (selectedSet.has(label)) {
      removeParticipant(label);
    } else {
      addParticipant(label);
    }
  }

  function addDraft() {
    addParticipant(draft);
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-3 text-sm">
      <span className="font-medium">الحضور</span>

      <input type="hidden" name="participants" value={participants.join("\n")} />

      {participants.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {participants.map((name) => (
            <li
              key={name}
              className="inline-flex items-center gap-1 border border-border bg-surface px-2 py-1"
            >
              <span>{name}</span>
              <button
                type="button"
                onClick={() => removeParticipant(name)}
                aria-label={`إزالة ${name}`}
                className="text-muted transition hover:text-foreground"
              >
                <XIcon className="size-3.5" weight="bold" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted">لم يُضف حضور بعد.</p>
      )}

      {admins.length > 0 ? (
        <div className="flex flex-col gap-2">
          <span className="text-muted">المشرفون</span>
          <ul className="flex flex-wrap gap-2">
            {admins.map((admin) => {
              const label = adminLabel(admin);
              const selected = selectedSet.has(label);
              return (
                <li key={admin.id}>
                  <button
                    type="button"
                    onClick={() => toggleAdmin(admin)}
                    className={
                      selected
                        ? "border border-foreground bg-foreground px-2.5 py-1.5 text-background"
                        : "border border-border px-2.5 py-1.5 text-foreground transition hover:bg-surface"
                    }
                  >
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addDraft();
            }
          }}
          placeholder="اسم آخر من الحضور"
          className="min-w-0 flex-1 border border-border bg-background px-3 py-2 outline-none focus:border-foreground"
        />
        <button
          type="button"
          onClick={addDraft}
          disabled={!draft.trim()}
          aria-label="إضافة حضور"
          className="inline-flex items-center justify-center border border-border px-3 transition hover:bg-surface disabled:opacity-40"
        >
          <PlusIcon className="size-5" weight="bold" />
        </button>
      </div>
    </div>
  );
}
