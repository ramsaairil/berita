import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import ArticleInteraction from "@/components/ArticleInteraction";
import CommentSection from "@/components/CommentSection";
import { getPopularCategories } from "@/lib/categories";

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

  return (
    <div className="bg-white dark:bg-[#121212] font-sans min-h-screen transition-colors duration-200">
      <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-12 lg:py-16 flex flex-col lg:flex-row gap-16 lg:gap-20">
        
        {/* Minimalist Centered Article Container */}
        <div className="w-full lg:w-[65%] xl:w-[70%]">
          <article className="max-w-[720px] mx-auto">
            
            {/* Header & Meta */}
            <header className="mb-10 text-left">
              <div className="mb-6">
                <Link href={`/category/${article.category.slug}`} className="inline-block text-blue-600 dark:text-blue-400 font-bold uppercase tracking-[0.15em] text-[13px] hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                  {article.category.name}
                </Link>
              </div>
              
              <h1 className="text-[36px] sm:text-[44px] lg:text-[48px] font-black leading-[1.18] tracking-tight mb-8 text-[#111] dark:text-white font-serif">
                {article.title}
              </h1>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start gap-4 sm:gap-5 border-b border-gray-100 dark:border-zinc-800 pb-8 mb-10">
                <img
                  src={article.author.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${article.author.name}`}
                  alt={article.author.name || "Author"}
                  className="w-12 h-12 rounded-full object-cover shadow-sm ring-1 ring-gray-200 dark:ring-zinc-700"
                />
                <div className="text-left">
                  <div className="font-bold text-[16px] text-gray-900 dark:text-white">{article.author.name}</div>
                  <div className="text-[14px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                    {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Baru saja"}
                    <span className="mx-2 text-gray-300 dark:text-zinc-600">·</span> 5 min read
                  </div>
                </div>
              </div>
            </header>

            {/* Framed Feature Image */}
            {article.featuredImg && (
              <figure className="mb-14">
                <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] rounded-2xl overflow-hidden bg-gray-50 dark:bg-zinc-900 ring-1 ring-black/5 dark:ring-white/10">
                  <Image
                    src={article.featuredImg}
                    fill
                    sizes="(max-width: 1024px) 100vw, 768px"
                    alt={article.title}
                    className="object-cover"
                    priority
                  />
                </div>
                <figcaption className="text-center text-gray-400 dark:text-gray-500 text-[13px] mt-3.5 font-serif italic px-6">
                  Ilustrasi visual berita yang berkaitan dengan topik {article.category.name.toLowerCase()}
                </figcaption>
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

            {/* Reading Typography Body */}
            <div className="prose prose-lg sm:prose-xl max-w-none 
              prose-p:leading-[1.8] prose-p:text-[#282828] dark:prose-p:text-[#e4e4e4] prose-p:font-serif
              prose-a:text-blue-600 prose-a:decoration-blue-200 hover:prose-a:decoration-blue-600 dark:prose-a:text-blue-400 dark:prose-a:decoration-blue-500/30
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-black dark:prose-headings:text-white prose-headings:font-sans
              prose-strong:text-black dark:prose-strong:text-white
              mb-16">
              
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

        {/* Sidebar - Stays sticked on the right for large screens */}
        <div className="w-full lg:w-[35%] xl:w-[30%]">
           <div className="sticky top-24">
             <Sidebar categories={categories} />
           </div>
        </div>

      </main>
    </div>
  );
}
