import Image from "next/image";
import Link from "next/link";
import { getCategoryColor } from "@/lib/categoryColors";

export default function HeroArticle({ article }: { article: any }) {
  const categoryColor = getCategoryColor(article.category.name);

  return (
    <div className="mb-10 pb-10 border-b-2 border-black">
      <Link href={`/berita/${article.slug}`} className="group block">
        {/* Featured Image */}
        {article.featuredImg && (
          <div className="relative w-full aspect-[16/9] mb-5 overflow-hidden bg-gray-100">
            <Image
              src={article.featuredImg}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 65vw"
              alt={article.title}
              className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
            />
          </div>
        )}

        {/* Category Label */}
        <p
          className="text-[11px] font-black uppercase tracking-[0.18em] mb-3"
          style={{ color: categoryColor }}
        >
          {article.category.name}
        </p>

        {/* Headline */}
        <h1 className="font-serif text-[30px] sm:text-[40px] lg:text-[46px] font-bold leading-[1.1] text-black group-hover:text-[#0d88b5] transition-colors duration-200 mb-4">
          {article.title}
        </h1>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-[17px] text-gray-600 leading-relaxed mb-5 line-clamp-3">
            {article.excerpt}
          </p>
        )}

        {/* Byline */}
        <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
          <span className="font-bold text-black">{article.author.name}</span>
          <span>·</span>
          <span>
            {article.publishedAt
              ? new Date(article.publishedAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "Draft"}
          </span>
        </div>
      </Link>
    </div>
  );
}
