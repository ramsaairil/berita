"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Anda belum login." };

  const name = formData.get("name") as string;
  const image = formData.get("image") as string;

  if (!name || name.trim() === "") {
    return { error: "Nama tidak boleh kosong." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: name.trim(),
      image: image.trim() || null
    }
  });

  // Revalidate layout and currently active pages where avatar may appear
  revalidatePath("/", "layout");

  return { success: true };
}
