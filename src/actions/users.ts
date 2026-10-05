"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import type { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const roleSchema = z.enum(["admin", "member", "participant"]);

const userFormSchema = z.object({
  name: z.string().trim().min(1, "الاسم مطلوب"),
  role: roleSchema,
  connectionId: z.string().optional(),
});

function revalidateUsers() {
  revalidatePath("/admins");
  revalidatePath("/");
}

export async function createUser(formData: FormData) {
  const current = await requireAdmin();
  void current;

  const data = userFormSchema.parse({
    name: formData.get("name"),
    role: formData.get("role"),
    connectionId: (formData.get("connectionId") as string) || undefined,
  });

  if (data.connectionId) {
    const connection = await prisma.connection.findUnique({
      where: { id: data.connectionId },
    });
    if (!connection) throw new Error("الاتصال غير موجود.");
    if (connection.userId) throw new Error("هذا الاتصال مربوط بمستخدم بالفعل.");

    await prisma.user.create({
      data: {
        name: data.name,
        image: connection.avatar,
        role: data.role,
        connections: { connect: { id: connection.id } },
      },
    });
  } else {
    await prisma.user.create({
      data: {
        name: data.name,
        role: data.role,
      },
    });
  }

  revalidateUsers();
}

export async function createUserFromConnection(
  connectionId: string,
  role: Role,
) {
  const current = await requireAdmin();
  void current;
  const parsedRole = roleSchema.parse(role);

  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
  });
  if (!connection) throw new Error("الاتصال غير موجود.");
  if (connection.userId) throw new Error("هذا الاتصال مربوط بمستخدم بالفعل.");

  await prisma.user.create({
    data: {
      name: connection.name,
      image: connection.avatar,
      role: parsedRole,
      connections: { connect: { id: connection.id } },
    },
  });

  revalidateUsers();
}

export async function updateUser(userId: string, formData: FormData) {
  const current = await requireAdmin();

  const data = userFormSchema.parse({
    name: formData.get("name"),
    role: formData.get("role"),
    connectionId: (formData.get("connectionId") as string) || undefined,
  });

  if (userId === current.id && data.role !== "admin") {
    throw new Error("لا يمكنك إزالة صلاحية المشرف عن نفسك.");
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    include: { connections: true },
  });
  if (!existing) throw new Error("المستخدم غير موجود.");

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        role: data.role,
      },
    });

    const currentConnectionId = existing.connections[0]?.id ?? null;
    const nextConnectionId = data.connectionId || null;

    if (currentConnectionId !== nextConnectionId) {
      if (currentConnectionId) {
        await tx.connection.update({
          where: { id: currentConnectionId },
          data: { userId: null },
        });
      }
      if (nextConnectionId) {
        const connection = await tx.connection.findUnique({
          where: { id: nextConnectionId },
        });
        if (!connection) throw new Error("الاتصال غير موجود.");
        if (connection.userId && connection.userId !== userId) {
          throw new Error("هذا الاتصال مربوط بمستخدم آخر.");
        }
        await tx.connection.update({
          where: { id: nextConnectionId },
          data: { userId },
        });
        if (connection.avatar) {
          await tx.user.update({
            where: { id: userId },
            data: { image: connection.avatar },
          });
        }
      }
    }
  });

  revalidateUsers();
}

export async function setUserBlocked(userId: string, isBlocked: boolean) {
  const current = await requireAdmin();

  if (userId === current.id && isBlocked) {
    throw new Error("لا يمكنك حظر حسابك.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isBlocked },
  });

  revalidateUsers();
}

export async function updateUserRole(userId: string, role: Role) {
  const current = await requireAdmin();
  const parsedRole = roleSchema.parse(role);

  if (userId === current.id && parsedRole !== "admin") {
    throw new Error("لا يمكنك إزالة صلاحية المشرف عن نفسك.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: parsedRole },
  });

  revalidateUsers();
}
