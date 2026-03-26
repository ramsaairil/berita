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
    <div className="flex bg-white font-sans text-black">
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 flex gap-12">
        {/* Main Content Area */}
        <div className="w-full lg:w-[65%]">
          <div className="flex flex-col gap-12">
            <ArticleList articles={articles as any} />
          </div>
        </div>
        <Sidebar categories={categories} />
      </main>
    </div>
  );
}
