import Image from "next/image";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { getCategoryColor } from "@/lib/categoryColors";

type ArticleWithRelations = Prisma.ArticleGetPayload<{
  include: {
    author: true;
    category: true;
  };
}>;

export default function ArticleList({ articles }: { articles: ArticleWithRelations[] }) {
  if (articles.length === 0) {
    return <p className="text-gray-500 pt-10">Belum ada artikel.</p>;
  }

  return (
    <div className="flex flex-col divide-y divide-gray-200">
      {articles.map((article) => {
        const categoryColor = getCategoryColor(article.category.name);
        return (
          <article key={article.id} className="group py-6 first:pt-0">
            <Link href={`/berita/${article.slug}`} className="flex gap-5 items-start">
              {/* Thumbnail */}
              {article.featuredImg && (
                <div className="shrink-0 w-[130px] sm:w-[160px] aspect-[4/3] relative overflow-hidden bg-gray-100">
                  <Image
                    src={article.featuredImg}
                    fill
                    sizes="(max-width: 768px) 130px, 160px"
                    alt={article.title}
                    className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                  />
                </div>
              )}

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-[10px] font-black uppercase tracking-[0.15em] mb-1.5"
                  style={{ color: categoryColor }}
                >
                  {article.category.name}
                </p>
                <h2 className="font-serif text-[18px] sm:text-[20px] font-bold leading-tight text-black group-hover:text-[#0d88b5] transition-colors duration-200 mb-2">
                  {article.title}
                </h2>
                {article.excerpt && (
                  <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2 mb-2">
                    {article.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
                  <span className="font-bold text-gray-600">{article.author.name}</span>
                  <span>·</span>
                  <span>
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Draft"}
                  </span>
                </div>
              </div>
            </Link>
          </article>
        );
      })}
    </div>
  );
}
