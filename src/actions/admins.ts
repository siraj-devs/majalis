"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function setUserAdmin(userId: string, isAdmin: boolean) {
  const current = await requireAdmin();

  if (userId === current.id && !isAdmin) {
    throw new Error("لا يمكنك إزالة صلاحية المشرف عن نفسك.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isAdmin },
  });

  revalidatePath("/admins");
}
