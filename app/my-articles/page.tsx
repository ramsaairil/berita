import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Heart, MessageCircle, Eye, PenSquare, Calendar } from "lucide-react";
import DeleteArticleButton from "@/components/ui/DeleteArticleButton";

export default async function MyArticlesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const articles = await prisma.article.findMany({
    where: { authorId: session.user.id },
    include: {
      category: true,
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight text-black">
            Artikel Saya
          </h1>
          <p className="text-gray-500 text-[15px] mt-1">
            {articles.length} berita telah diterbitkan
          </p>
        </div>
        <Link
          href="/write"
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-[14px] font-bold hover:bg-gray-800 transition-all hover:shadow-lg"
        >
          <PenSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Tulis Berita</span>
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
          <p className="text-[28px] font-bold text-black">{articles.length}</p>
          <p className="text-[13px] text-gray-500 font-medium mt-1">Berita</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
          <p className="text-[28px] font-bold text-[#e11d48]">
            {articles.reduce((sum, a) => sum + a._count.likes, 0)}
          </p>
          <p className="text-[13px] text-gray-500 font-medium mt-1">Total Like</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
          <p className="text-[28px] font-bold text-[#0d88b5]">
            {articles.reduce((sum, a) => sum + a._count.comments, 0)}
          </p>
          <p className="text-[13px] text-gray-500 font-medium mt-1">Total Komentar</p>
        </div>
      </div>

      {/* Articles List */}
      {articles.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <PenSquare className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">Belum ada berita yang diterbitkan.</p>
          <Link
            href="/write"
            className="inline-flex items-center gap-2 mt-4 bg-black text-white px-6 py-3 rounded-full text-[14px] font-bold hover:bg-gray-800 transition-all"
          >
            <PenSquare className="w-4 h-4" />
            Tulis Berita Pertama
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 overflow-hidden"
            >
              <div className="flex gap-4 p-4 sm:p-5">
                {/* Thumbnail */}
                {article.featuredImg ? (
                  <div className="shrink-0 w-[100px] h-[75px] sm:w-[130px] sm:h-[90px] relative rounded-xl overflow-hidden">
                    <Image
                      src={article.featuredImg}
                      fill
                      sizes="130px"
                      alt={article.title}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="shrink-0 w-[100px] h-[75px] sm:w-[130px] sm:h-[90px] rounded-xl bg-gray-100 flex items-center justify-center">
                    <PenSquare className="w-6 h-6 text-gray-300" />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <Link href={`/berita/${article.slug}`} className="hover:text-[#0d88b5] transition-colors">
                      <h2 className="font-bold text-[15px] sm:text-[17px] leading-snug text-[#1a1a1a] line-clamp-2">
                        {article.title}
                      </h2>
                    </Link>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-[11px] font-bold text-[#0d88b5] bg-[#ebf5fa] px-2.5 py-0.5 rounded-full">
                      {article.category.name}
                    </span>
                    <div className="flex items-center gap-1 text-[12px] text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Draft"}
                    </div>
                  </div>

                  {/* Stats & Actions */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-500">
                        <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                        {article._count.likes}
                      </div>
                      <div className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-500">
                        <MessageCircle className="w-4 h-4 text-[#0d88b5]" />
                        {article._count.comments}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/berita/${article.slug}`}
                        className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 hover:text-black hover:bg-gray-100 px-3 py-1.5 rounded-full transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Lihat
                      </Link>
                      <DeleteArticleButton articleId={article.id} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
