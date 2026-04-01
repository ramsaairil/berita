import Sidebar from "@/components/Sidebar";
import Pagination from "@/components/Pagination";
import prisma from "@/lib/prisma";
import { getPopularCategories } from "@/lib/categories";
import HeroArticle from "@/components/HeroArticle";
import ArticleGrid from "@/components/ArticleGrid";

export default async function Home(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page =
    typeof searchParams?.page === "string" ? parseInt(searchParams.page) : 1;
  const limit = 7;
  const skip = (page - 1) * limit;

  const [articles, totalArticles] = await Promise.all([
    prisma.article.findMany({
      include: { author: true, category: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: skip,
    }),
    prisma.article.count(),
  ]);

  const totalPages = Math.ceil(totalArticles / limit);
  const categories = await getPopularCategories();

  // First article = hero, rest = grid
  const heroArticle = articles[0];
  const gridArticles = articles.slice(1);

  return (
    <div className="bg-white text-black min-h-screen">
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col lg:flex-row gap-12">
        {/* Main Content */}
        <div className="w-full lg:w-[65%]">
          {/* Hero Article */}
          {heroArticle && <HeroArticle article={heroArticle} />}

          {/* Section Divider */}
          {gridArticles.length > 0 && (
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 shrink-0">
                Berita Terbaru
              </h2>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          )}

          {/* Article Grid */}
          <ArticleGrid articles={gridArticles as any} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <Pagination currentPage={page} totalPages={totalPages} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <Sidebar categories={categories} />
      </main>
    </div>
  );
}
