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
      _count: {
        select: { comments: true }
      },
      comments: {
        include: {
          author: true,
          commentLikes: true,
        },
        orderBy: { createdAt: "asc" }
      }
    },
  });

  if (!article) {
    notFound();
  }

  const session = await getSession();
  const isLoggedIn = !!session;
  const isLikedByMe = session ? article.likes.some(like => like.userId === session.user.id) : false;
  const isBookmarkedByMe = session ? article.bookmarks.some(b => b.userId === session.user.id) : false;

  // Fetch Recommended Articles (same category, exclude current)
  const relatedArticles = await prisma.article.findMany({
    where: {
      categoryId: article.categoryId,
      id: { not: article.id }
    },
    take: 3,
    include: {
      author: true,
      category: true,
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  // Fetch all categories for the Sidebar
  const categories = await getPopularCategories();

  return (
    <div className="bg-white font-sans text-black min-h-screen">
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col lg:flex-row gap-12">
        {/* Main Content Area: Left Block */}
        <div className="w-full lg:w-[65%]">
          <article className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-10 border border-gray-100 shadow-sm">
            <h1 className="text-[28px] sm:text-[40px] font-bold leading-[1.3] tracking-tight mb-6 sm:mb-8">
              {article.title}
            </h1>

            {/* Author & Meta */}
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 border-b border-gray-100 pb-6 sm:pb-8">
              <img
                src={article.author.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${article.author.name}`}
                alt={article.author.name || "Author"}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-gray-100 shrink-0"
              />
              <div className="flex flex-col">
                <span className="text-[15px] sm:text-[16px] font-medium text-black">
                  {article.author.name}
                </span>
                <div className="flex items-center gap-2 text-[13px] sm:text-[14px] text-gray-500 mt-0.5">
                  <span>
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                      : "Baru saja"}
                  </span>
                </div>
              </div>
            </div>

            <ArticleInteraction
              articleId={article.id}
              initialLikes={article.likes.length}
              initialIsLiked={isLikedByMe}
              initialIsBookmarked={isBookmarkedByMe}
              commentCount={article._count.comments}
            />

            {article.featuredImg && (
              <div className="my-8 sm:my-12 flex justify-center">
                <Image
                  src={article.featuredImg}
                  width={800}
                  height={450}
                  alt={article.title}
                  className="w-full max-h-[400px] object-cover rounded-xl"
                />
              </div>
            )}

            <div className="prose prose-lg max-w-none prose-p:leading-8 prose-p:text-[18px] sm:prose-p:text-[20px] prose-p:text-[#242424] prose-a:text-black">
              <p className="whitespace-pre-wrap">{article.content}</p>
            </div>

            <div className="mt-8 sm:mt-12 flex items-center gap-2 flex-wrap pb-10">
              {article.tags.map(tag => (
                <Link key={tag.id} href={`/`} className="bg-gray-100 hover:bg-gray-200 transition-colors text-black px-4 py-2 rounded-full text-[14px]">
                  {tag.name}
                </Link>
              ))}
            </div>

            <CommentSection
              articleId={article.id}
              comments={article.comments as any}
              totalCommentCount={article._count.comments}
              isLoggedIn={isLoggedIn}
              currentUserId={session?.user?.id}
            />
          </article>
        </div>

        {/* Right Block: Rekomendasi Berita & Kategori */}
        <div className="hidden lg:block lg:w-[35%] pl-8">
          <div className="sticky top-24 flex flex-col gap-6">
            {/* Related Articles Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-[16px] mb-6">Rekomendasi Berita</h3>
              {relatedArticles.length > 0 ? (
                <div className="flex flex-col gap-6">
                  {relatedArticles.map(rel => (
                    <Link href={`/berita/${rel.slug}`} key={rel.id} className="group block">
                      <div className="flex gap-4 items-center">
                        {rel.featuredImg && (
                          <div className="shrink-0 w-[80px] h-[80px] relative rounded-xl overflow-hidden">
                            <Image src={rel.featuredImg} fill sizes="80px" alt={rel.title} className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-bold text-[14px] leading-snug group-hover:text-[#0d88b5] transition-colors duration-200 line-clamp-3 text-[#1a1a1a]">{rel.title}</h4>
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-2 font-medium">
                            <span>{rel.publishedAt ? new Date(rel.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "Baru saja"}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Belum ada berita terkait.</p>
              )}
            </div>

            {/* Sidebar Kategori Inline */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
              <h2 className="text-[16px] font-bold mb-6">Kategori Populer</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Link key={cat.id} href={`/category/${cat.slug}`} className="bg-gray-50 hover:bg-gray-100 transition-colors text-black px-4 py-2 rounded-full text-[14px] border border-gray-100">
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
