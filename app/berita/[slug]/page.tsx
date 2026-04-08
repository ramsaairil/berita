import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import ArticleInteraction from "@/components/features/articles/ArticleInteraction";
import CommentSection from "@/components/features/articles/CommentSection";
import ArticleGrid from "@/components/features/articles/ArticleGrid";
import { getPopularCategories } from "@/lib/categories";
import { getCategoryColor } from "@/lib/categoryColors";

/** Mengkonversi plain text jadi HTML paragraf secara otomatis */
function formatArticleContent(content: string): string {
  if (!content) return '';
  // Jika teks memiliki format tag HTML (dari Rich Text Editor), biarkan.
  if (/<(p|h1|h2|h3|ul|ol|li|blockquote|strong|em|u|s|a)[\s\S]*>/i.test(content)) return content;
  
  // Jika berupa teks biasa (plain text), pecah berdasarkan DOUBLE ENTER (paragraf)
  // dan bungkus setiap paragraf dengan <p> agar stylenya rapih
  return content
    .split(/\n\r?\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => `<p>${p.replace(/\n/g, '<br />')}</p>`)
    .join('\n');
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: article, error } = await supabase
    .from("Article")
    .select(`
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
      ),
      tags:Tag (*),
      likes:Like (userId),
      bookmarks:Bookmark (userId),
      comments:Comment (
        *,
        author:User (
          id,
          name,
          image
        ),
        commentLikes:CommentLike (*)
      )
    `)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !article) notFound();

  const session = await getSession();
  const isLoggedIn = !!session;

  const isLikedByMe = session?.user?.id
    ? article.likes.some((like: { userId: string }) => like.userId === session.user.id)
    : false;

  const isBookmarkedByMe = session?.user?.id
    ? article.bookmarks.some((b: { userId: string }) => b.userId === session.user.id)
    : false;

  const { data: relatedArticles } = await supabase
    .from("Article")
    .select(`
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
    `)
    .neq("id", article.id)
    .eq("status", "PUBLISHED")
    .order("createdAt", { ascending: false })
    .limit(3);

  const categories = await getPopularCategories();
  const categoryColor = getCategoryColor(article.category.name);

  // Re-sort comments by createdAt asc (Supabase may not guarantee order in nested select)
  const sortedComments = [...(article.comments || [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="bg-white font-sans min-h-screen">
      <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-12 lg:py-16 flex flex-col lg:flex-row gap-16 lg:gap-20">

        {/* Minimalist Centered Article Container */}
        <div className="w-full lg:w-[65%] xl:w-[70%]">
          <article className="max-w-[720px] mx-auto">

            {/* Header & Meta */}
            <header className="mb-10 text-left">
              <div className="mb-6">
                <Link
                  href={`/category/${article.category.slug}`}
                  className="inline-block text-[11px] font-black uppercase tracking-[0.18em] hover:opacity-70 transition-opacity"
                  style={{ color: categoryColor }}
                >
                  {article.category.name}
                </Link>
              </div>

              <h1 className="text-[34px] sm:text-[42px] lg:text-[48px] font-bold leading-[1.15] tracking-tight mb-8 text-[#111] font-serif">
                {article.title}
              </h1>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start gap-4 sm:gap-5 border-b border-gray-200 pb-8 mb-10">
                <img
                  src={article.author.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${article.author.name}`}
                  alt={article.author.name || "Author"}
                  className="w-11 h-11 rounded-full object-cover ring-1 ring-gray-200"
                />
                <div className="text-left">
                  <div className="font-bold text-[15px] text-gray-900">{article.author.name}</div>
                  <div className="text-[13px] text-gray-400 mt-0.5">
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                      : "Baru saja"}
                  </div>
                </div>
              </div>
            </header>

            {/* Framed Feature Image */}
            {article.featuredImg && (
              <figure className="mb-12">
                <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] overflow-hidden bg-gray-100">
                  <Image
                    src={article.featuredImg}
                    fill
                    sizes="(max-width: 1024px) 100vw, 768px"
                    alt={article.title}
                    className="object-cover"
                    priority
                  />
                </div>
              </figure>
            )}

            {/* Substack-style Interaction Bar */}
            <div className="mb-12">
              <ArticleInteraction
                articleId={article.id}
                initialLikes={article.likes?.length || 0}
                initialIsLiked={isLikedByMe}
                initialIsBookmarked={isBookmarkedByMe}
                commentCount={article.comments?.length || 0}
              />
            </div>

            {/* Article Body */}
            <div className="prose prose-lg sm:prose-xl max-w-none
              prose-p:leading-[1.8] prose-p:text-[#292929] prose-p:font-serif
              prose-p:mb-8
              prose-p:first-of-type:first-letter:text-7xl 
              prose-p:first-of-type:first-letter:font-bold 
              prose-p:first-of-type:first-letter:float-left 
              prose-p:first-of-type:first-letter:mr-3 
              prose-p:first-of-type:first-letter:mt-1
              prose-p:first-of-type:first-letter:text-black
              prose-li:text-[#292929] prose-li:font-serif
              prose-h1:text-3xl prose-h1:font-bold prose-h1:font-serif prose-h1:mb-6
              prose-h2:text-2xl prose-h2:font-bold prose-h2:font-serif prose-h2:mb-4
              prose-a:text-black prose-a:font-bold prose-a:underline prose-a:decoration-1 hover:prose-a:opacity-70
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-black prose-headings:font-serif
              prose-strong:text-black
              mb-12">
              <div dangerouslySetInnerHTML={{ __html: formatArticleContent(article.content) }} />
            </div>

            {/* Minimal Tags */}
            {article.tags?.length > 0 && (
              <div className="flex items-center gap-2.5 flex-wrap border-t border-gray-100 dark:border-zinc-800 pt-10 mb-14">
                <span className="text-gray-400 dark:text-gray-500 font-bold mr-2 text-[12px] uppercase tracking-widest">TAGS:</span>
                {article.tags.map((tag: any) => (
                  <Link key={tag.id} href={`/`} className="bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors ring-1 ring-gray-200 dark:ring-zinc-800">
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}


            <div className="pt-2 mb-12">
              <CommentSection
                articleId={article.id}
                comments={sortedComments as any}
                totalCommentCount={article.comments?.length || 0}
                isLoggedIn={isLoggedIn}
                currentUserId={session?.user?.id}
              />
            </div>

            {/* Berita Terkait Section */}
            {relatedArticles && relatedArticles.length > 0 && (
              <div className="border-t border-gray-200 dark:border-zinc-800 pt-16 mt-16 mb-14">
                <div className="max-w-[720px] mx-auto">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold font-serif text-black tracking-tight">Temukan Lebih Banyak</h3>
                    <Link
                      href={`/`}
                      className="text-sm font-bold text-gray-500 hover:text-black transition-colors flex items-center gap-1 group"
                    >
                      Lihat Semua
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                  <ArticleGrid articles={relatedArticles as any} />
                </div>
              </div>
            )}
          </article>
        </div>

        {/* Sidebar */}
        <Sidebar categories={categories} />

      </main>
    </div>
  );
}
