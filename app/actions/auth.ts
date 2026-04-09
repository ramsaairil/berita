"use server";

import bcrypt from "bcryptjs";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

export async function registerAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password || !name) {
    return { error: "Semua field wajib diisi!" };
  }

  // Check if email already exists
  const { data: existing } = await supabase
    .from("User")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    return { error: "Email sudah terdaftar!" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Create user in Supabase
  const { data: user, error: createError } = await supabase
    .from("User")
    .insert([
      {
        id: crypto.randomUUID(),
        name,
        email,
        password: hashedPassword,
        role: "USER",
        updatedAt: new Date().toISOString()
      }
    ])
    .select()
    .single();

  if (createError || !user) {
    console.error("Register Error:", createError);
    return { error: "Gagal mendaftarkan akun." };
  }

  await createSession({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name || "User",
  });

  return { success: true };
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email dan Password wajib diisi!" };
  }

  const { data: user, error: findError } = await supabase
    .from("User")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (findError || !user || !user.password) {
    return { error: "Email tidak ditemukan atau kredensial salah!" };
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return { error: "Password salah!" };
  }

  await createSession({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name || "User",
  });

  return { success: true };
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
