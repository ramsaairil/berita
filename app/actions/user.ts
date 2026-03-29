"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Anda belum login." };

  const name = formData.get("name") as string;
  const imageFile = formData.get("image") as File | null;

  if (!name || name.trim() === "") {
    return { error: "Nama tidak boleh kosong." };
  }

  let imageUrl = undefined;

  // Process File Upload if it exists and is populated
  if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
     if (!imageFile.type.startsWith("image/")) {
       return { error: "File yang diunggah harus berupa gambar (JPG, PNG, dsb)." };
     }
     if (imageFile.size > 5 * 1024 * 1024) {
       return { error: "Ukuran gambar maksimal adalah 5MB." };
     }

     const bytes = await imageFile.arrayBuffer();
     const buffer = Buffer.from(bytes);

     const uploadDir = join(process.cwd(), "public", "uploads");
     if (!existsSync(uploadDir)) {
       await mkdir(uploadDir, { recursive: true });
     }

     const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
     const safeFilename = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "-");
     const filename = `${uniqueSuffix}-${safeFilename}`;
     const filePath = join(uploadDir, filename);

     await writeFile(filePath, buffer);
     imageUrl = `/uploads/${filename}`;
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: name.trim(),
      ...(imageUrl !== undefined && { image: imageUrl })
    }
  });

  // Revalidate layout and currently active pages where avatar may appear
  revalidatePath("/", "layout");

  return { success: true };
}
