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
    <div className="flex bg-white font-sans text-black min-h-screen">
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 flex gap-12">
        {/* Main Content Area: Left Block */}
        <div className="w-full lg:w-[65%]">
          <article>
            <h1 className="text-[40px] font-bold leading-[48px] tracking-tight mb-8">
              {article.title}
            </h1>

            {/* Author & Meta */}
            <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-8">
              <img
                src={article.author.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${article.author.name}`}
                alt={article.author.name || "Author"}
                className="w-12 h-12 rounded-full object-cover border border-gray-100 shrink-0"
              />
              <div className="flex flex-col">
                <span className="text-[16px] font-medium text-black">
                  {article.author.name}
                </span>
                <div className="flex items-center gap-2 text-[14px] text-gray-500 mt-0.5">
                  <span>3 min read</span>
                  <span>·</span>
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
              commentCount={article._count.comments}
            />

            {article.featuredImg && (
              <div className="mb-12 flex justify-center">
                <Image
                  src={article.featuredImg}
                  width={800}
                  height={450}
                  alt={article.title}
                  className="w-full max-w-[550px] max-h-[350px] object-cover rounded-xl"
                />
              </div>
            )}

            <div className="prose prose-lg max-w-none prose-p:leading-8 prose-p:text-[20px] prose-p:text-[#242424] prose-a:text-black">
              <p className="whitespace-pre-wrap">{article.content}</p>
            </div>

            <div className="mt-12 flex items-center gap-2 flex-wrap pb-10">
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
        <div className="hidden lg:block lg:w-[35%] border-l border-gray-100 pl-10">
          <div className="sticky top-24">
            {/* Related Articles Box */}
            <div className="mb-12">
              <h3 className="font-bold text-[16px] mb-6 border-b border-gray-100 pb-2">Rekomendasi Berita</h3>
              {relatedArticles.length > 0 ? (
                <div className="flex flex-col gap-6">
                  {relatedArticles.map(rel => (
                    <Link href={`/berita/${rel.slug}`} key={rel.id} className="group">
                      <div className="flex gap-4 items-start">
                        {rel.featuredImg && (
                          <Image src={rel.featuredImg} width={80} height={80} alt={rel.title} className="w-20 h-20 object-cover shrink-0 rounded" />
                        )}
                        <div>
                          <h4 className="font-bold text-[15px] leading-snug group-hover:underline line-clamp-2 mb-1 text-black">{rel.title}</h4>
                          <span className="text-[13px] text-gray-500 line-clamp-2">{rel.excerpt}</span>
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
            <div className="mt-10 border-t border-gray-100 pt-8">
              <h2 className="text-[16px] font-bold mb-6">Kategori Populer</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Link key={cat.id} href={`/category/${cat.slug}`} className="bg-gray-100 hover:bg-gray-200 transition-colors text-black px-4 py-2 rounded-full text-[14px]">
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
