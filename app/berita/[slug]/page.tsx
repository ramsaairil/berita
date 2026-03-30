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
    <div className="bg-white font-sans text-black min-h-screen">
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col lg:flex-row gap-12">
        {/* Main Content Area */}
        <div className="w-full lg:w-[65%]">
          <article className="bg-white">
            
            {/* Editorial Header */}
            <header className="mb-8">
              <div className="mb-4">
                <Link href={`/category/${article.category.slug}`} className="text-blue-600 font-bold uppercase tracking-widest text-sm hover:text-blue-800 transition-colors">
                  {article.category.name}
                </Link>
              </div>
              <h1 className="text-[32px] sm:text-[46px] font-extrabold leading-[1.2] tracking-tight mb-6 text-[#121212]">
                {article.title}
              </h1>
              
              <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-6">
                <div className="flex items-center gap-4">
                  <img
                    src={article.author.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${article.author.name}`}
                    alt={article.author.name || "Author"}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                  />
                  <div>
                    <div className="font-bold text-[16px] text-gray-900">{article.author.name}</div>
                    <div className="text-[14px] text-gray-500 font-medium">
                      {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Baru saja"}
                      <span className="mx-2">·</span> 5 min read
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Bleed Image */}
            {article.featuredImg && (
              <figure className="mb-10 sm:mb-14">
                <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-gray-50 shadow-sm">
                  <Image
                    src={article.featuredImg}
                    fill
                    sizes="(max-width: 1024px) 100vw, 65vw"
                    alt={article.title}
                    className="object-cover"
                    priority
                  />
                </div>
                <figcaption className="text-center text-gray-400 text-sm mt-3 font-serif italic">
                  Ilustrasi liputan terkait {article.category.name.toLowerCase()}
                </figcaption>
              </figure>
            )}

            {/* Interaction Bar (Top) */}
            <div className="mb-10">
              <ArticleInteraction
                articleId={article.id}
                initialLikes={article.likes.length}
                initialIsLiked={isLikedByMe}
                initialIsBookmarked={isBookmarkedByMe}
                commentCount={article._count.comments}
              />
            </div>

            {/* Typography Content Body */}
            <div className="prose prose-xl prose-stone max-w-none prose-p:leading-relaxed prose-p:text-[#242424] prose-a:text-blue-600 prose-a:decoration-blue-300 hover:prose-a:decoration-blue-600 prose-headings:font-bold prose-headings:tracking-tight mb-16 font-serif">
              {/* Fallback rendering of HTML content if string contains HTML tags, otherwise pre-wrap */}
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>

            {/* Tags Area */}
            {article.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap border-t border-gray-100 pt-8 mb-12">
                <span className="text-gray-500 font-bold mr-2 text-sm uppercase tracking-widest">TAGS:</span>
                {article.tags.map(tag => (
                  <Link key={tag.id} href={`/`} className="bg-gray-50 hover:bg-gray-200 transition-colors text-gray-700 px-4 py-1.5 rounded-full text-[13px] font-medium border border-gray-200">
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Interaction Bar (Bottom) */}
            <div className="border-y border-gray-100 py-6 mb-12">
              <ArticleInteraction
                articleId={article.id}
                initialLikes={article.likes.length}
                initialIsLiked={isLikedByMe}
                initialIsBookmarked={isBookmarkedByMe}
                commentCount={article._count.comments}
              />
            </div>

            {/* Comments */}
            <CommentSection
              articleId={article.id}
              comments={article.comments as any}
              totalCommentCount={article._count.comments}
              isLoggedIn={isLoggedIn}
              currentUserId={session?.user?.id}
            />
          </article>
        </div>

        {/* Universal Sidebar */}
        <Sidebar categories={categories} />
      </main>
    </div>
  );
}
