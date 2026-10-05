"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { isEndAfterStart, normalizeTime } from "@/lib/time";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const timeSchema = z
  .string()
  .regex(/^\d{2}:\d{2}(?::\d{2})?$/)
  .transform(normalizeTime);

const meetingSchema = z
  .object({
    date: z.string().min(1),
    startTime: timeSchema,
    endTime: timeSchema,
    notes: z.string().optional(),
    participantIds: z.array(z.string().min(1)).default([]),
  })
  .refine((data) => isEndAfterStart(data.startTime, data.endTime), {
    message: "وقت النهاية يجب أن يكون بعد وقت البداية",
    path: ["endTime"],
  });

function parseParticipantIds(formData: FormData): string[] {
  return formData
    .getAll("participantIds")
    .map(String)
    .map((id) => id.trim())
    .filter(Boolean);
}

function parseMeetingForm(formData: FormData) {
  return meetingSchema.parse({
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    notes: (formData.get("notes") as string) || undefined,
    participantIds: parseParticipantIds(formData),
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
      createdById: user.id,
      attendees: {
        create: data.participantIds.map((userId) => ({ userId })),
      },
    },
  });

  revalidatePath("/");
}

export async function updateMeeting(id: string, formData: FormData) {
  await requireAdmin();
  const data = parseMeetingForm(formData);

  await prisma.$transaction([
    prisma.meetingParticipant.deleteMany({ where: { meetingId: id } }),
    prisma.meeting.update({
      where: { id },
      data: {
        date: parseDateOnly(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes?.trim() || null,
        attendees: {
          create: data.participantIds.map((userId) => ({ userId })),
        },
      },
    }),
  ]);

  revalidatePath("/");
}

export async function deleteMeeting(id: string) {
  await requireAdmin();
  await prisma.meeting.delete({ where: { id } });
  revalidatePath("/");
}
