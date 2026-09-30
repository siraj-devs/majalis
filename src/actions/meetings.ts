"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const meetingSchema = z.object({
  date: z.string().min(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().optional(),
  participants: z.string().optional(),
});

function parseParticipants(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[\n,]/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function parseMeetingForm(formData: FormData) {
  return meetingSchema.parse({
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    notes: (formData.get("notes") as string) || undefined,
    participants: (formData.get("participants") as string) || undefined,
  });
}

function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export async function createMeeting(formData: FormData) {
  const user = await requireAdmin();
  const data = parseMeetingForm(formData);

  await prisma.meeting.create({
    data: {
      date: parseDateOnly(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      notes: data.notes?.trim() || null,
      participants: parseParticipants(data.participants),
      createdById: user.id,
    },
  });

  revalidatePath("/");
  redirect("/");
}

export async function updateMeeting(id: string, formData: FormData) {
  await requireAdmin();
  const data = parseMeetingForm(formData);

  await prisma.meeting.update({
    where: { id },
    data: {
      date: parseDateOnly(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      notes: data.notes?.trim() || null,
      participants: parseParticipants(data.participants),
    },
  });

  revalidatePath("/");
  revalidatePath(`/meetings/${id}/edit`);
  redirect("/");
}

export async function deleteMeeting(id: string) {
  await requireAdmin();
  await prisma.meeting.delete({ where: { id } });
  revalidatePath("/");
  redirect("/");
}
