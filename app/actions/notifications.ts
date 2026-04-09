"use server";

import { supabase, supabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  const session = await getSession();
  if (!session) return [];

  const { data: notifications, error } = await supabase
    .from("Notification")
    .select(`
      *,
      actor:User!actorId (
        id,
        name,
        image
      ),
      article:Article (
        title,
        slug
      ),
      comment:Comment (
        content
      )
    `)
    .eq("userId", session.user.id)
    .order("createdAt", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }

  return notifications;
}

export async function getUnreadCount() {
  const session = await getSession();
  if (!session) return 0;

  const { count, error } = await supabase
    .from("Notification")
    .select("*", { count: "exact", head: true })
    .eq("userId", session.user.id)
    .eq("read", false);

  if (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }

  return count || 0;
}

export async function markAsRead(id: string) {
  const session = await getSession();
  if (!session) return { error: "Not logged in" };

  const { error } = await supabaseAdmin
    .from("Notification")
    .update({ read: true })
    .eq("id", id)
    .eq("userId", session.user.id);

  if (error) {
    console.error("Error marking notification as read:", error);
    return { error: "Gagal menandai notifikasi." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function markAllAsRead() {
  const session = await getSession();
  if (!session) return { error: "Not logged in" };

  const { error } = await supabaseAdmin
    .from("Notification")
    .update({ read: true })
    .eq("userId", session.user.id)
    .eq("read", false);

  if (error) {
    console.error("Error marking all as read:", error);
    return { error: "Gagal menandai semua notifikasi." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
