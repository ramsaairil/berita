"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function toggleLike(articleId: string) {
  const session = await getSession();
  if (!session) return { error: "Silakan masuk (login) untuk memberikan tepuk tangan (like)." };

  const userId = session.user.id;

  const existingLike = await prisma.like.findUnique({
    where: {
      userId_articleId: { userId, articleId }
    }
  });

  if (existingLike) {
    await prisma.like.delete({ where: { id: existingLike.id } });
  } else {
    await prisma.like.create({
      data: { userId, articleId }
    });
  }

  revalidatePath(`/berita/[slug]`, "page");
  return { success: true };
}

export async function addComment(articleId: string, content: string, parentId?: string) {
  const session = await getSession();
  if (!session) return { error: "Silakan masuk (login) untuk berkomentar." };
  
  if (!content.trim()) return { error: "Komentar tidak boleh kosong." };

  await prisma.comment.create({
    data: {
      content,
      articleId,
      authorId: session.user.id,
      parentId: parentId || null
    }
  });

  revalidatePath(`/berita/[slug]`, "page");
  return { success: true };
}

export async function toggleCommentLike(commentId: string) {
  const session = await getSession();
  if (!session) return { error: "Silakan masuk (login) untuk menyukai komentar." };

  const userId = session.user.id;

  const existingLike = await prisma.commentLike.findUnique({
    where: {
      userId_commentId: { userId, commentId }
    }
  });

  if (existingLike) {
    await prisma.commentLike.delete({ where: { id: existingLike.id } });
  } else {
    await prisma.commentLike.create({
      data: { userId, commentId }
    });
  }

  revalidatePath(`/berita/[slug]`, "page");
  return { success: true };
}
