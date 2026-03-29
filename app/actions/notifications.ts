"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  const session = await getSession();
  if (!session) return [];

  return await (prisma as any).notification.findMany({
    where: { userId: session.user.id },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      },
      article: {
        select: {
          title: true,
          slug: true,
        }
      },
      comment: {
        select: {
          content: true,
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function getUnreadCount() {
  const session = await getSession();
  if (!session) return 0;

  return await (prisma as any).notification.count({
    where: { 
      userId: session.user.id,
      read: false 
    },
  });
}

export async function markAsRead(id: string) {
  const session = await getSession();
  if (!session) return { error: "Not logged in" };

  await (prisma as any).notification.update({
    where: { id, userId: session.user.id },
    data: { read: true },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function markAllAsRead() {
  const session = await getSession();
  if (!session) return { error: "Not logged in" };

  await (prisma as any).notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  revalidatePath("/", "layout");
  return { success: true };
}
