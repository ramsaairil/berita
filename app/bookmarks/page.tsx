import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import ArticleList from "@/components/features/articles/ArticleList";
import { redirect } from "next/navigation";

export default async function BookmarksPage() {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }

  const { data: bookmarks, error } = await supabase
    .from("Bookmark")
    .select(`
      article:Article (
        *,
        author:User (
          id,
          name,
          image
        ),
        category:Category (
          id,
          name,
          slug
        )
      )
    `)
    .eq("userId", session.user.id)
    .order("createdAt", { ascending: false });

  const articles = (bookmarks || []).map((b: any) => b.article).filter(Boolean);

  return (
    <div className="bg-white min-h-screen font-sans">
      <main className="max-w-5xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-[32px] sm:text-[40px] font-bold tracking-tight text-[#1a1a1a]">
            Berita yang Disimpan
          </h1>
          <p className="text-gray-500 mt-2 text-[16px]">
            {articles.length} artikel tersimpan di koleksi Anda.
          </p>
        </header>

        <div className="space-y-6">
          <ArticleList articles={articles as any} />
          
          {articles.length === 0 && (
            <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-16 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <p className="text-gray-500 text-[18px] font-medium">Belum ada berita yang Anda simpan.</p>
              <p className="text-gray-400 mt-1">Berita yang Anda simpan akan muncul di sini agar mudah dibaca nanti.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
