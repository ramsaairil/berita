"use server";

import bcrypt from "bcryptjs";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export async function registerAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password || !name) {
    return { error: "Semua field wajib diisi!" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Email sudah terdaftar!" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "USER"
    }
  });

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

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
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
