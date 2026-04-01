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

function ArticleCard({ article }: { article: ArticleWithRelations }) {
  const categoryColor = getCategoryColor(article.category.name);

  return (
    <article className="group">
      <Link href={`/berita/${article.slug}`} className="block">
        {/* Image */}
        {article.featuredImg ? (
          <div className="relative w-full aspect-[16/9] mb-4 overflow-hidden bg-gray-100">
            <Image
              src={article.featuredImg}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              alt={article.title}
              className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
            />
          </div>
        ) : (
          <div className="w-full aspect-[16/9] mb-4 bg-gray-100" />
        )}

        {/* Category */}
        <p
          className="text-[11px] font-black uppercase tracking-[0.15em] mb-2"
          style={{ color: categoryColor }}
        >
          {article.category.name}
        </p>

        {/* Headline */}
        <h2 className="font-serif text-[20px] sm:text-[22px] font-bold leading-tight text-black group-hover:text-[#0d88b5] transition-colors duration-200 mb-2.5">
          {article.title}
        </h2>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2 mb-3">
            {article.excerpt}
          </p>
        )}

        {/* Byline */}
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
      </Link>
    </article>
  );
}

export default function ArticleGrid({ articles }: { articles: ArticleWithRelations[] }) {
  if (articles.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
