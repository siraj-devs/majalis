"use client";

import { setUserAdmin } from "@/actions/admins";
import { useTransition } from "react";

type AdminToggleProps = {
  userId: string;
  isAdmin: boolean;
  disabled?: boolean;
};

export function AdminToggle({ userId, isAdmin, disabled }: AdminToggleProps) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={disabled || pending}
      onClick={() => {
        startTransition(async () => {
          try {
            await setUserAdmin(userId, !isAdmin);
          } catch (error) {
            alert(error instanceof Error ? error.message : "حدث خطأ");
          }
        });
      }}
      className="border border-border px-3 py-1.5 text-sm transition hover:bg-surface disabled:opacity-50"
    >
      {pending ? "..." : isAdmin ? "إزالة الإشراف" : "تعيين مشرفًا"}
    </button>
  );
}
