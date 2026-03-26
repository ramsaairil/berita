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
        <article key={article.id} className="flex gap-6 group">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <img
                src={article.author.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${article.author.name}`}
                alt={article.author.name || "Author"}
                className="rounded-full w-6 h-6 object-cover border border-gray-100"
              />
              <span className="text-[14px] font-medium">
                {article.author.name}
              </span>
              <span className="text-gray-500 text-[14px]">in</span>
              <span className="text-[14px] font-medium">{article.category.name}</span>
            </div>
            <Link href={`/berita/${article.slug}`}>
              <h2 className="text-[22px] font-bold leading-7 mb-2 group-hover:underline decoration-1 underline-offset-[3px]">
                {article.title}
              </h2>
              <p className="text-[16px] text-[#242424] leading-6 mb-4 line-clamp-2">
                {article.excerpt}
              </p>
            </Link>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[13px] text-gray-500">
                <span>
                  {article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })
                    : "Draft"}
                </span>
                <span>·</span>
                <span>3 min read</span>
                <span>·</span>
                <span className="bg-gray-100 rounded-full px-2 py-0.5 mt-0.5">{article.category.name}</span>
              </div>
            </div>
          </div>
          {article.featuredImg && (
            <Link href={`/berita/${article.slug}`} className="hidden sm:block shrink-0">
              <Image
                src={article.featuredImg}
                width={180}
                height={120}
                alt={article.title}
                className="object-cover w-[180px] h-[120px]"
              />
            </Link>
          )}
        </article>
      ))}
    </>
  );
}
