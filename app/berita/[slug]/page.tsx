import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import ArticleInteraction from "@/components/features/articles/ArticleInteraction";
import CommentSection from "@/components/features/articles/CommentSection";
import { getPopularCategories } from "@/lib/categories";
import { getCategoryColor } from "@/lib/categoryColors";


export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug: slug },
    include: {
      author: true,
      category: true,
      tags: true,
      likes: true,
      bookmarks: true,
      _count: { select: { comments: true } },
      comments: {
        include: { author: true, commentLikes: true },
        orderBy: { createdAt: "asc" }
      }
    },
  });

  if (!article) notFound();

  const session = await getSession();
  const isLoggedIn = !!session;
  const isLikedByMe = session ? article.likes.some(like => like.userId === session.user.id) : false;
  const isBookmarkedByMe = session ? article.bookmarks.some(b => b.userId === session.user.id) : false;

  const relatedArticles = await prisma.article.findMany({
    where: { categoryId: article.categoryId, id: { not: article.id } },
    take: 3,
    include: { author: true, category: true },
    orderBy: { createdAt: "desc" }
  });

  const categories = await getPopularCategories();

  const categoryColor = getCategoryColor(article.category.name);

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
                initialLikes={article.likes.length}
                initialIsLiked={isLikedByMe}
                initialIsBookmarked={isBookmarkedByMe}
                commentCount={article._count.comments}
              />
            </div>

            {/* Article Body */}
            <div className="prose prose-lg sm:prose-xl max-w-none
              prose-p:leading-[1.9] prose-p:text-[#333] prose-p:font-serif
              prose-a:text-black prose-a:font-bold prose-a:underline prose-a:decoration-2 hover:prose-a:opacity-70
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-black prose-headings:font-serif
              prose-strong:text-black
              mb-14">
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>

            {/* Minimal Tags */}
            {article.tags.length > 0 && (
              <div className="flex items-center gap-2.5 flex-wrap border-t border-gray-100 dark:border-zinc-800 pt-10 mb-14">
                <span className="text-gray-400 dark:text-gray-500 font-bold mr-2 text-[12px] uppercase tracking-widest">TAGS:</span>
                {article.tags.map(tag => (
                  <Link key={tag.id} href={`/`} className="bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors ring-1 ring-gray-200 dark:ring-zinc-800">
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Comments Area inside the narrow column for focus */}
            <div className="border-t border-gray-100 dark:border-zinc-800 pt-6">
              <CommentSection
                articleId={article.id}
                comments={article.comments as any}
                totalCommentCount={article._count.comments}
                isLoggedIn={isLoggedIn}
                currentUserId={session?.user?.id}
              />
            </div>
          </article>
        </div>

        {/* Sidebar */}
        <Sidebar categories={categories} />

      </main>
    </div>
  );
}
