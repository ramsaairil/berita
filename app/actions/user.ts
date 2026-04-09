"use server";

import { supabase, supabaseAdmin } from "@/lib/supabase";
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

  let imageUrl: string | undefined = undefined;

  // Process File Upload if it exists and is populated
  if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
     if (!imageFile.type.startsWith("image/")) {
       return { error: "File yang diunggah harus berupa gambar (JPG, PNG, dsb)." };
     }
     if (imageFile.size > 5 * 1024 * 1024) {
       return { error: "Ukuran gambar maksimal adalah 5MB." };
     }

     const bytes = await imageFile.arrayBuffer();
     const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
     const safeFilename = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "-");
     const filename = `${uniqueSuffix}-${safeFilename}`;

     if (process.env.VERCEL || process.env.NODE_ENV === "production") {
       // Upload to Supabase Storage in production / Vercel
       const { error: uploadError } = await supabaseAdmin.storage
         .from("uploads")
         .upload(`avatars/${filename}`, bytes, {
           contentType: imageFile.type,
           upsert: false
         });
         
       if (uploadError) {
         console.error("Supabase storage error:", uploadError);
         return { error: "Gagal upload gambar. Hubungi administrator." };
       }
       
       const { data: publicUrlData } = supabase.storage
         .from("uploads")
         .getPublicUrl(`avatars/${filename}`);
         
       imageUrl = publicUrlData.publicUrl;
     } else {
       // Local dev storage fallback
       const buffer = Buffer.from(bytes);
       const uploadDir = join(process.cwd(), "public", "uploads");
       if (!existsSync(uploadDir)) {
         await mkdir(uploadDir, { recursive: true });
       }
       const filePath = join(uploadDir, filename);
       await writeFile(filePath, buffer);
       imageUrl = `/uploads/${filename}`;
     }
  }

  const { error } = await supabaseAdmin
    .from("User")
    .update({
      name: name.trim(),
      ...(imageUrl !== undefined && { image: imageUrl })
    })
    .eq("id", session.user.id);

  if (error) {
    console.error("Profile update error:", error);
    return { error: "Gagal memperbarui profil." };
  }

  // Revalidate layout and currently active pages where avatar may appear
  revalidatePath("/", "layout");

  return { success: true };
}
