"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function getUsersAction() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized", users: [] };
  }

  const { data, error } = await supabaseAdmin
    .from("User")
    .select("id, name, email, role, image, createdAt")
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users", users: [] };
  }

  return { success: true, error: null, users: data || [] };
}

export async function changeUserRoleAction(userId: string, newRole: "ADMIN" | "USER") {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  // Prevent admin from demoting themselves
  if (userId === session.user.id && newRole === "USER") {
    return { success: false, error: "Anda tidak dapat menurunkan role Anda sendiri." };
  }

  const { error } = await supabaseAdmin
    .from("User")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) {
    console.error("Error changing role:", error);
    return { success: false, error: "Gagal mengubah role pengguna." };
  }

  revalidatePath("/admin/users");
  return { success: true, error: null };
}

export async function deleteUserAction(userId: string) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  // Prevent admin from deleting themselves
  if (userId === session.user.id) {
    return { success: false, error: "Anda tidak dapat menghapus akun Anda sendiri melalui dashboard admin." };
  }

  const { error } = await supabaseAdmin
    .from("User")
    .delete()
    .eq("id", userId);

  if (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Gagal menghapus pengguna." };
  }

  revalidatePath("/admin/users");
  return { success: true, error: null };
}
