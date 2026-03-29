import Image from "next/image";
import Link from "next/link";
import { Prisma } from "@prisma/client";

// Define a type for our matched articles
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
    <>
      {articles.map((article) => (
        <article key={article.id} className="flex flex-col sm:flex-row gap-5 group border border-gray-100 rounded-2xl p-4 bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-gray-200 hover:-translate-y-1 transition-all duration-300">
          {article.featuredImg && (
            <Link href={`/berita/${article.slug}`} className="shrink-0 w-full sm:w-[220px] aspect-[4/3] sm:h-[140px] relative rounded-xl overflow-hidden block">
              <Image
                src={article.featuredImg}
                fill
                sizes="(max-width: 768px) 100vw, 220px"
                alt={article.title}
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </Link>
          )}
          <div className="flex-1 flex flex-col py-1">
            <div className="flex items-center gap-2 mb-2">
              <img
                src={article.author.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${article.author.name}`}
                alt={article.author.name || "Author"}
                className="rounded-full w-5 h-5 object-cover border border-gray-100"
              />
              <span className="text-[13px] font-medium">{article.author.name}</span>
              <span className="text-gray-400 text-[13px]">·</span>
              <span className="text-[13px] font-medium text-gray-500">{article.category.name}</span>
            </div>

            <Link href={`/berita/${article.slug}`} className="block mb-2">
              <h2 className="text-[18px] sm:text-[20px] font-bold leading-snug group-hover:text-[#0d88b5] transition-colors duration-200 text-[#1a1a1a]">
                {article.title}
              </h2>
            </Link>

            <p className="text-[14px] text-gray-600 leading-relaxed mb-4 line-clamp-2">
              {article.excerpt}
            </p>

            <div className="mt-auto flex items-center gap-2 text-[12px] text-gray-500 font-medium">
              <span>
                {article.publishedAt
                  ? new Date(article.publishedAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })
                  : "Draft"}
              </span>

            </div>
          </div>
        </article>
      ))}
    </>
  );
}
