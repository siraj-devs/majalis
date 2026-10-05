"use client";

import { useMemo, useState } from "react";

export type UserOption = {
  id: string;
  name: string | null;
  telegramUsername: string | null;
  role: string;
};

type ParticipantsFieldProps = {
  defaultSelectedIds?: string[];
  users: UserOption[];
};

function userLabel(user: UserOption): string {
  if (user.name?.trim()) return user.name.trim();
  if (user.telegramUsername) return `@${user.telegramUsername}`;
  return user.id;
}

export function ParticipantsField({
  defaultSelectedIds = [],
  users,
}: ParticipantsFieldProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(defaultSelectedIds);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  function toggle(userId: string) {
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  }

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium">الحضور</span>
        <span className="text-xs text-muted">
          {selectedIds.length} / {users.length}
        </span>
      </div>

      {selectedIds.map((id) => (
        <input key={id} type="hidden" name="participantIds" value={id} />
      ))}

      {users.length === 0 ? (
        <p className="text-muted">
          لا يوجد مستخدمون بعد. أنشئ مستخدمين من صفحة المستخدمين.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {users.map((user) => {
            const selected = selectedSet.has(user.id);
            return (
              <li key={user.id}>
                <button
                  type="button"
                  onClick={() => toggle(user.id)}
                  aria-pressed={selected}
                  className={
                    selected
                      ? "border border-foreground bg-foreground px-3 py-1.5 text-background transition"
                      : "border border-border bg-background px-3 py-1.5 text-foreground transition hover:bg-surface"
                  }
                >
                  {userLabel(user)}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
