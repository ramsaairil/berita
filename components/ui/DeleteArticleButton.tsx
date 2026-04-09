"use client";

import { useState, useTransition } from "react";
import { deleteArticle } from "@/app/actions/article";
import { Trash2, Loader2 } from "lucide-react";

export default function DeleteArticleButton({ articleId }: { articleId: string }) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      await deleteArticle(articleId);
      setShowConfirm(false);
    });
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[12px] text-gray-500 font-medium">Hapus berita ini?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-full text-[12px] font-bold hover:bg-red-600 transition-colors disabled:opacity-60"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
          Ya, Hapus
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="px-3 py-1.5 rounded-full text-[12px] font-bold text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Batal
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="flex items-center gap-1.5 text-[13px] font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-full transition-colors"
    >
      <Trash2 className="w-3.5 h-3.5" />
      Hapus
    </button>
  );
}
