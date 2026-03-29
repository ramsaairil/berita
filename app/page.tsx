import ArticleList from "@/components/ArticleList";
import Sidebar from "@/components/Sidebar";
import prisma from "@/lib/prisma";

import { getPopularCategories } from "@/lib/categories";

export default async function Home() {
  const articles = await prisma.article.findMany({
    include: {
      author: true,
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const categories = await getPopularCategories();

  return (
    <div className="bg-[#ebf5fa] font-sans text-black min-h-screen">
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col lg:flex-row gap-12">
        {/* Main Content Area */}
        <div className="w-full lg:w-[65%]">
          <div className="flex flex-col gap-6">
            <ArticleList articles={articles as any} />
          </div>
        </div>
        <Sidebar categories={categories} />
      </main>
    </div>
  );
}
