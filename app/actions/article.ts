"use server";

import { supabase, supabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { redirect } from "next/navigation";

export async function deleteArticle(articleId: string) {
  const session = await getSession();
  if (!session) return { error: "Silakan login terlebih dahulu." };

  const { data: article, error: findError } = await supabase
    .from("Article")
    .select("authorId")
    .eq("id", articleId)
    .maybeSingle();

  if (findError || !article) {
    return { error: "Artikel tidak ditemukan." };
  }

  const isAuthor = article.authorId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isAuthor && !isAdmin) {
    return { error: "Anda tidak memiliki izin untuk menghapus artikel ini." };
  }

  const { error: deleteError } = await supabase
    .from("Article")
    .delete()
    .eq("id", articleId);

  if (deleteError) {
    console.error("Delete Error:", deleteError);
    return { error: "Gagal menghapus artikel." };
  }

  revalidatePath("/my-articles");
  revalidatePath("/");
  return { success: true };
}

export async function createArticle(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/write?error=" + encodeURIComponent("Silakan login terlebih dahulu."));

  // Karena sistem auth kita sekarang sudah ada, kita gunakan session user
  const user = session.user;

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const categoryId = formData.get("categoryId") as string;
  const excerpt = formData.get("excerpt") as string;
  const imageFile = formData.get("featuredImg") as File;

  let featuredImg = null;

  if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
    if (!imageFile.type?.startsWith("image/")) {
      redirect("/write?error=" + encodeURIComponent("File yang diunggah harus berupa gambar."));
    }
    if (imageFile.size > 5 * 1024 * 1024) {
      redirect("/write?error=" + encodeURIComponent("Ukuran gambar tidak boleh lebih dari 5MB."));
    }

    const bytes = await imageFile.arrayBuffer();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeFilename = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "-");
    const filename = `${uniqueSuffix}-${safeFilename}`;

    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      // Upload to Supabase Storage in production / Vercel
      const { error: uploadError } = await supabaseAdmin.storage
        .from("uploads")
        .upload(`articles/${filename}`, bytes, {
          contentType: imageFile.type,
          upsert: false
        });

      if (uploadError) {
        console.error("Supabase storage error:", uploadError);
        redirect("/write?error=" + encodeURIComponent(`Gagal upload gambar ke Supabase: ${uploadError.message}`));
      }

      const { data: publicUrlData } = supabase.storage
        .from("uploads")
        .getPublicUrl(`articles/${filename}`);

      featuredImg = publicUrlData.publicUrl;
    } else {
      // Local dev storage fallback
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), "public", "uploads", "articles");

      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (e) { }

      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);
      featuredImg = `/uploads/articles/${filename}`;
    }
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

  const payload = {
    id: crypto.randomUUID(),
    title,
    content,
    excerpt,
    featuredImg,
    slug,
    status: "PUBLISHED",
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorId: user.id,
    categoryId: categoryId,
  };

  const { error } = await supabaseAdmin.from("Article").insert(payload);

  if (error) {
    console.error("Create article error:", error);
    redirect("/write?error=" + encodeURIComponent(`Gagal Database: ${error.message}`));
  }

  revalidatePath("/");
  redirect("/");
}
