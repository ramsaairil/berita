import Sidebar from "@/components/layout/Sidebar";
import Pagination from "@/components/ui/Pagination";
import prisma from "@/lib/prisma";
import { getPopularCategories } from "@/lib/categories";
import HeroSlider from "@/components/features/articles/HeroSlider";
import ArticleGrid from "@/components/features/articles/ArticleGrid";

export default async function Home(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page =
    typeof searchParams?.page === "string" ? parseInt(searchParams.page) : 1;
  const limit = 9;
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

  // First 3 articles = slider, rest = grid
  const sliderArticles = page === 1 ? articles.slice(0, 3) : [];
  const gridArticles = page === 1 ? articles.slice(3) : articles;

  return (
    <div className="bg-white text-black min-h-screen">
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col lg:flex-row gap-12">
        {/* Main Content */}
        <div className="w-full lg:w-[65%]">
          {/* Hero Slider */}
          {sliderArticles.length > 0 && <HeroSlider articles={sliderArticles as any} />}

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
