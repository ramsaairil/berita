"use server";

import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function toggleLike(articleId: string) {
  const session = await getSession();
  if (!session) return { error: "Silakan login untuk memberikan like.", authError: true };

  const userId = session.user.id;

  const { data: existingLike } = await supabase
    .from("Like")
    .select("id")
    .eq("userId", userId)
    .eq("articleId", articleId)
    .maybeSingle();

  if (existingLike) {
    await supabase.from("Like").delete().eq("id", existingLike.id);
  } else {
    await supabase.from("Like").insert({ userId, articleId });
  }

  revalidatePath(`/berita/[slug]`, "page");
  return { success: true };
}

export async function addComment(articleId: string, content: string, parentId?: string) {
  const session = await getSession();
  if (!session) return { error: "Silakan login untuk berkomentar.", authError: true };
  
  if (!content.trim()) return { error: "Komentar tidak boleh kosong." };

  const { data: comment, error: createError } = await supabase
    .from("Comment")
    .insert({
      content,
      articleId,
      authorId: session.user.id,
      parentId: parentId || null
    })
    .select()
    .single();

  if (createError || !comment) {
    console.error("Comment Error:", createError);
    return { error: "Gagal mengirim komentar." };
  }

  // Trigger Notification for Reply
  if (parentId) {
    const { data: parentComment } = await supabase
      .from("Comment")
      .select("authorId")
      .eq("id", parentId)
      .single();

    if (parentComment && parentComment.authorId !== session.user.id) {
      await supabase.from("Notification").insert({
        type: "REPLY_COMMENT",
        userId: parentComment.authorId,
        actorId: session.user.id,
        articleId: articleId,
        commentId: comment.id
      });
    }
  }

  revalidatePath(`/berita/[slug]`, "page");
  return { success: true };
}

export async function toggleCommentLike(commentId: string) {
  const session = await getSession();
  if (!session) return { error: "Silakan login untuk menyukai komentar.", authError: true };

  const userId = session.user.id;

  const { data: existingLike } = await supabase
    .from("CommentLike")
    .select("id")
    .eq("userId", userId)
    .eq("commentId", commentId)
    .maybeSingle();

  if (existingLike) {
    await supabase.from("CommentLike").delete().eq("id", existingLike.id);
  } else {
    const { data: like, error } = await supabase
      .from("CommentLike")
      .insert({ userId, commentId })
      .select(`
        *,
        Comment (
          authorId,
          articleId
        )
      `)
      .single();

    if (error || !like) {
       console.error("Comment Like Error:", error);
       return { error: "Gagal menyukai komentar." };
    }

    const comment: any = like.Comment;

    // Trigger Notification for Like
    if (comment.authorId !== userId) {
      await supabase.from("Notification").insert({
        type: "LIKE_COMMENT",
        userId: comment.authorId,
        actorId: userId,
        articleId: comment.articleId,
        commentId: commentId
      });
    }
  }

  revalidatePath(`/berita/[slug]`, "page");
  return { success: true };
}

export async function toggleBookmark(articleId: string) {
  const session = await getSession();
  if (!session) return { error: "Silakan login untuk menyimpan berita.", authError: true };

  const userId = session.user.id;

  const { data: existingBookmark } = await supabase
    .from("Bookmark")
    .select("id")
    .eq("userId", userId)
    .eq("articleId", articleId)
    .maybeSingle();

  if (existingBookmark) {
    await supabase.from("Bookmark").delete().eq("id", existingBookmark.id);
  } else {
    await supabase.from("Bookmark").insert({ userId, articleId });
  }

  revalidatePath("/bookmarks");
  return { success: true };
}

export async function deleteComment(commentId: string) {
  const session = await getSession();
  if (!session) return { error: "Silakan login untuk menghapus komentar.", authError: true };

  const { data: comment } = await supabase
    .from("Comment")
    .select("authorId, articleId")
    .eq("id", commentId)
    .maybeSingle();

  if (!comment) return { error: "Komentar tidak ditemukan." };

  const isAuthor = comment.authorId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isAuthor && !isAdmin) {
    return { error: "Anda tidak memiliki izin untuk menghapus komentar ini." };
  }

  await supabase.from("Comment").delete().eq("id", commentId);

  revalidatePath(`/berita/[slug]`, "page");
  return { success: true };
}
