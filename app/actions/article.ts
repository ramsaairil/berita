"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteArticle(articleId: string) {
  const session = await getSession();
  if (!session) return { error: "Silakan login terlebih dahulu." };

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { authorId: true },
  });

  if (!article) return { error: "Artikel tidak ditemukan." };

  const isAuthor = article.authorId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isAuthor && !isAdmin) {
    return { error: "Anda tidak memiliki izin untuk menghapus artikel ini." };
  }

  await prisma.article.delete({ where: { id: articleId } });

  revalidatePath("/my-articles");
  revalidatePath("/");
  return { success: true };
}
