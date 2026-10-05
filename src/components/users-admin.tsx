"use client";

import {
  createUser,
  createUserFromConnection,
  setUserBlocked,
  updateUser,
} from "@/actions/users";
import type { Role } from "@prisma/client";
import {
  CheckCircleIcon,
  PencilSimpleIcon,
  PlusIcon,
  ProhibitIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState, useTransition } from "react";

type PendingConnection = {
  id: string;
  name: string;
  username: string;
};

type ManagedUser = {
  id: string;
  name: string | null;
  role: Role;
  isBlocked: boolean;
  connections: { id: string; username: string; name: string }[];
};

type UsersAdminProps = {
  currentUserId: string;
  pendingConnections: PendingConnection[];
  users: ManagedUser[];
};

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "admin", label: "مشرف" },
  { value: "member", label: "عضو" },
  { value: "participant", label: "حضور" },
];

type ModalMode =
  | { type: "create" }
  | { type: "edit"; user: ManagedUser }
  | { type: "block"; user: ManagedUser }
  | null;

export function UsersAdmin({
  currentUserId,
  pendingConnections,
  users,
}: UsersAdminProps) {
  const [modal, setModal] = useState<ModalMode>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [blockPending, startBlockTransition] = useTransition();

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
    <div className="space-y-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">المستخدمون</h1>
          <p className="mt-1 text-sm text-muted">
            إنشاء وتعديل المستخدمين وربط تيليغرام وإدارة الأدوار والحظر.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ type: "create" })}
          className="inline-flex shrink-0 items-center gap-2 bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:bg-neutral-800"
        >
          <PlusIcon weight="bold" className="size-4" />
          مستخدم جديد
        </button>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="font-medium">بانتظار الربط</h2>
          <p className="mt-1 text-sm text-muted">
            سجّلوا الدخول عبر تيليغرام ولم يُنشأ لهم حساب بعد.
          </p>
        </div>
        {pendingConnections.length === 0 ? (
          <p className="border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
            لا يوجد اتصالات معلّقة.
          </p>
        ) : (
          <ul className="divide-y divide-border border border-border">
            {pendingConnections.map((connection) => (
              <PendingRow key={connection.id} connection={connection} />
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-medium">الحسابات</h2>
        {users.length === 0 ? (
          <p className="border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
            لا يوجد مستخدمون بعد.
          </p>
        ) : (
          <ul className="divide-y divide-border border border-border">
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              return (
                <li
                  key={user.id}
                  className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5"
                >
                  <div>
                    <p className="font-medium">
                      {user.name ?? "بدون اسم"}
                      {isSelf ? (
                        <span className="mr-2 text-sm font-normal text-muted">
                          · أنت
                        </span>
                      ) : null}
                      {user.isBlocked ? (
                        <span className="mr-2 text-sm font-normal text-muted">
                          · محظور
                        </span>
                      ) : null}
                    </p>
                    <p className="text-sm text-muted">
                      {roleLabel(user.role)}
                      {user.connections[0]
                        ? ` · @${user.connections[0].username}`
                        : " · غير مربوط بتيليغرام"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setModal({ type: "edit", user })}
                      aria-label="تعديل"
                      className="p-2 text-muted transition hover:bg-surface hover:text-foreground"
                    >
                      <PencilSimpleIcon className="size-5" />
                    </button>
                    <button
                      type="button"
                      disabled={isSelf}
                      onClick={() => setModal({ type: "block", user })}
                      aria-label={user.isBlocked ? "رفع الحظر" : "حظر"}
                      className="p-2 text-muted transition hover:bg-surface hover:text-foreground disabled:opacity-40"
                    >
                      {user.isBlocked ? (
                        <CheckCircleIcon className="size-5" />
                      ) : (
                        <ProhibitIcon className="size-5" />
                      )}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <dialog
        ref={dialogRef}
        onClose={closeModal}
        className="m-auto w-[calc(100%-2rem)] max-w-lg border border-border bg-background p-0 text-foreground shadow-lg backdrop:bg-black/40 open:flex open:flex-col"
      >
        {modal?.type === "block" ? (
          <>
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-lg font-bold">
                {modal.user.isBlocked ? "رفع الحظر" : "تأكيد الحظر"}
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
            <div className="space-y-5 px-5 py-5">
              <p className="text-sm text-muted">
                {modal.user.isBlocked
                  ? "هل تريد رفع الحظر عن "
                  : "هل تريد حظر "}
                <span className="font-medium text-foreground">
                  {modal.user.name ?? "هذا المستخدم"}
                </span>
                ؟
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={blockPending}
                  className="h-11 flex-1 border border-border px-4 text-sm transition hover:bg-surface disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={blockPending}
                  onClick={() => {
                    startBlockTransition(async () => {
                      try {
                        await setUserBlocked(
                          modal.user.id,
                          !modal.user.isBlocked,
                        );
                        closeModal();
                      } catch (error) {
                        alert(
                          error instanceof Error ? error.message : "حدث خطأ",
                        );
                      }
                    });
                  }}
                  className="h-11 flex-1 bg-foreground px-4 text-sm font-semibold text-background transition hover:bg-neutral-800 disabled:opacity-50"
                >
                  {blockPending
                    ? "..."
                    : modal.user.isBlocked
                      ? "رفع الحظر"
                      : "حظر"}
                </button>
              </div>
            </div>
          </>
        ) : null}

        {modal?.type === "create" || modal?.type === "edit" ? (
          <>
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-lg font-bold">
                {modal.type === "create" ? "مستخدم جديد" : "تعديل المستخدم"}
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
            <div className="px-5 py-5">
              <UserForm
                key={modal.type === "edit" ? modal.user.id : "create"}
                mode={modal.type}
                user={modal.type === "edit" ? modal.user : undefined}
                isSelf={
                  modal.type === "edit" && modal.user.id === currentUserId
                }
                pendingConnections={pendingConnections}
                onDone={closeModal}
              />
            </div>
          </>
        ) : null}
      </dialog>
    </div>
  );
}

function roleLabel(role: Role) {
  return ROLE_OPTIONS.find((o) => o.value === role)?.label ?? role;
}

function PendingRow({ connection }: { connection: PendingConnection }) {
  const [pending, startTransition] = useTransition();
  const [role, setRole] = useState<Role>("participant");

  return (
    <li className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div>
        <p className="font-medium">{connection.name}</p>
        <p className="text-sm text-muted">@{connection.username}</p>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-foreground"
        >
          {ROLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              try {
                await createUserFromConnection(connection.id, role);
              } catch (error) {
                alert(error instanceof Error ? error.message : "حدث خطأ");
              }
            });
          }}
          className="bg-foreground px-3 py-1.5 text-sm font-semibold text-background transition hover:bg-neutral-800 disabled:opacity-50"
        >
          {pending ? "..." : "إنشاء وربط"}
        </button>
      </div>
    </li>
  );
}

function UserForm({
  mode,
  user,
  isSelf,
  pendingConnections,
  onDone,
}: {
  mode: "create" | "edit";
  user?: ManagedUser;
  isSelf?: boolean;
  pendingConnections: PendingConnection[];
  onDone: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const linkedId = user?.connections[0]?.id ?? "";
  const linkOptions =
    mode === "edit" && user?.connections[0]
      ? [user.connections[0], ...pendingConnections]
      : pendingConnections;

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          try {
            if (mode === "create") {
              await createUser(formData);
            } else if (user) {
              await updateUser(user.id, formData);
            }
            onDone();
          } catch (error) {
            alert(error instanceof Error ? error.message : "حدث خطأ");
          }
        });
      }}
      className="flex flex-col gap-4"
    >
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">الاسم</span>
        <input
          name="name"
          required
          defaultValue={user?.name ?? ""}
          className="border border-border bg-background px-3 py-2 outline-none focus:border-foreground"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">الدور</span>
        <select
          name="role"
          defaultValue={user?.role ?? "participant"}
          disabled={isSelf}
          className="border border-border bg-background px-3 py-2 outline-none focus:border-foreground disabled:opacity-50"
        >
          {ROLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">ربط تيليغرام</span>
        <select
          name="connectionId"
          defaultValue={linkedId}
          className="border border-border bg-background px-3 py-2 outline-none focus:border-foreground"
        >
          <option value="">بدون ربط</option>
          {linkOptions.map((connection) => (
            <option key={connection.id} value={connection.id}>
              @{connection.username}
              {"name" in connection && connection.name
                ? ` — ${connection.name}`
                : ""}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="h-11 bg-foreground px-6 text-sm font-semibold text-background transition hover:bg-neutral-800 disabled:opacity-50"
      >
        {pending ? "..." : mode === "create" ? "إنشاء" : "حفظ"}
      </button>
    </form>
  );
}
