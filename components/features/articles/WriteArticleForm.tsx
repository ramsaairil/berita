"use client";

import { useState } from "react";
import { createArticle } from "@/app/actions/article";
import ArticleImageUpload from "@/components/features/articles/ArticleImageUpload";
import RichTextEditor from "@/components/features/articles/RichTextEditor";

export default function WriteArticleForm({ categories, errorMessage }: { categories: any[], errorMessage?: string }) {
  const [content, setContent] = useState("");

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black font-sans text-gray-900 dark:text-white uppercase tracking-tight">Tulis Berita Baru</h1>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium">
          {errorMessage}
        </div>
      )}

      <form action={createArticle} className="space-y-6 bg-white dark:bg-zinc-900 p-8 border border-gray-200 dark:border-zinc-800 rounded-[32px] shadow-sm">
        
        {/* Hidden Content Input for TipTap */}
        <input type="hidden" name="content" value={content} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-8">
          <div className="flex flex-col gap-6">
            <div>
              <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wider">Judul Artikel</label>
              <input
                name="title"
                required
                className="w-full bg-gray-50/50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white p-4 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all placeholder:text-gray-300 text-lg font-bold"
                placeholder="Masukkan judul berita yang menarik..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wider">Kategori</label>
                <select name="categoryId" required className="w-full bg-gray-50/50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white p-4 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white outline-none cursor-pointer transition-all">
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wider">Ringkasan (Optional)</label>
                <input
                  name="excerpt"
                  className="w-full bg-gray-50/50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white p-4 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all placeholder:text-gray-300"
                  placeholder="Ringkasan singkat berita..."
                />
              </div>
            </div>
          </div>

          <div>
             <ArticleImageUpload />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wider">Isi Berita</label>
          <RichTextEditor value={content} onChange={setContent} />
        </div>

        <div className="pt-4 flex justify-end">
          <button type="submit" className="bg-black dark:bg-white text-white dark:text-black px-12 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
            Publikasi Sekarang
          </button>
        </div>

      </form>
    </div>
  );
}
