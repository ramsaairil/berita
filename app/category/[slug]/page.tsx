import prisma from "@/lib/prisma";
import ArticleList from "@/components/ArticleList";
import Sidebar from "@/components/Sidebar";
import { notFound } from "next/navigation";
import { getPopularCategories } from "@/lib/categories";
import { getCategoryColor } from "@/lib/categoryColors";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) notFound();

  const articles = await prisma.article.findMany({
    where: { categoryId: category.id },
    include: { author: true, category: true },
    orderBy: { createdAt: "desc" },
  });

  const categories = await getPopularCategories();
  const categoryColor = getCategoryColor(category.name);

  return (
    <div className="bg-white text-black min-h-screen">
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col lg:flex-row gap-12">
        {/* Main Content Area */}
        <div className="w-full lg:w-[65%]">
          {/* Category Header — Vox-style */}
          <header className="mb-10 pb-6 border-b-2 border-black">
            <p
              className="text-[11px] font-black uppercase tracking-[0.2em] mb-3"
              style={{ color: categoryColor }}
            >
              Kategori
            </p>
            <h1 className="font-serif text-[36px] sm:text-[48px] font-bold leading-tight text-black">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-[16px] text-gray-500 mt-3 leading-relaxed">
                {category.description}
              </p>
            )}
            <p className="text-[13px] text-gray-400 mt-2 font-semibold">
              {articles.length} artikel
            </p>
          </header>

          {/* Article List */}
          <ArticleList articles={articles as any} />
        </div>

        {/* Sidebar */}
        <Sidebar categories={categories} />
      </main>
    </div>
  );
}
