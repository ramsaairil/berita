"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function toggleLike(articleId: string) {
  const session = await getSession();
  if (!session) return { error: "Silakan login untuk memberikan like." };

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
  if (!session) return { error: "Silakan login untuk berkomentar." };
  
  if (!content.trim()) return { error: "Komentar tidak boleh kosong." };

  const comment = await prisma.comment.create({
    data: {
      content,
      articleId,
      authorId: session.user.id,
      parentId: parentId || null
    }
  });

  // Trigger Notification for Reply
  if (parentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { authorId: true }
    });

    if (parentComment && parentComment.authorId !== session.user.id) {
      await (prisma as any).notification.create({
        data: {
          type: "REPLY_COMMENT",
          userId: parentComment.authorId,
          actorId: session.user.id,
          articleId: articleId,
          commentId: comment.id
        }
      });
    }
  }

  revalidatePath(`/berita/[slug]`, "page");
  return { success: true };
}

export async function toggleCommentLike(commentId: string) {
  const session = await getSession();
  if (!session) return { error: "Silakan login untuk menyukai komentar." };

  const userId = session.user.id;

  const existingLike = await prisma.commentLike.findUnique({
    where: {
      userId_commentId: { userId, commentId }
    }
  });

  if (existingLike) {
    await prisma.commentLike.delete({ where: { id: existingLike.id } });
  } else {
    const like = await prisma.commentLike.create({
      data: { userId, commentId },
      include: {
        comment: {
          select: {
            authorId: true,
            articleId: true
          }
        }
      }
    });

    // Trigger Notification for Like
    if (like.comment.authorId !== userId) {
      await (prisma as any).notification.create({
        data: {
          type: "LIKE_COMMENT",
          userId: like.comment.authorId,
          actorId: userId,
          articleId: like.comment.articleId,
          commentId: commentId
        }
      });
    }
  }

  revalidatePath(`/berita/[slug]`, "page");
  return { success: true };
}

export async function toggleBookmark(articleId: string) {
  const session = await getSession();
  if (!session) return { error: "Silakan login untuk menyimpan berita." };

  const userId = session.user.id;

  const existingBookmark = await prisma.bookmark.findUnique({
    where: {
      userId_articleId: { userId, articleId }
    }
  });

  if (existingBookmark) {
    await prisma.bookmark.delete({ where: { id: existingBookmark.id } });
  } else {
    await prisma.bookmark.create({
      data: { userId, articleId }
    });
  }

  revalidatePath("/bookmarks");
  return { success: true };
}

export async function deleteComment(commentId: string) {
  const session = await getSession();
  if (!session) return { error: "Silakan login untuk menghapus komentar." };

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true, articleId: true }
  });

  if (!comment) return { error: "Komentar tidak ditemukan." };

  const isAuthor = comment.authorId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isAuthor && !isAdmin) {
    return { error: "Anda tidak memiliki izin untuk menghapus komentar ini." };
  }

  await prisma.comment.delete({
    where: { id: commentId }
  });

  revalidatePath(`/berita/[slug]`, "page");
  return { success: true };
}
