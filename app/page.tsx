import ArticleList from "@/components/ArticleList";
import Sidebar from "@/components/Sidebar";
import Pagination from "@/components/Pagination";
import prisma from "@/lib/prisma";

import { getPopularCategories } from "@/lib/categories";

// Provide type generic to support Next.js 15+ searchParams Promise
export default async function Home(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const page = typeof searchParams?.page === "string" ? parseInt(searchParams.page) : 1;
  const limit = 7;
  const skip = (page - 1) * limit;

  // Use Promise.all to fetch both chunked items and count simultaneously for maximum speed
  const [articles, totalArticles] = await Promise.all([
    prisma.article.findMany({
      include: {
        author: true,
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: skip,
    }),
    prisma.article.count()
  ]);

  const totalPages = Math.ceil(totalArticles / limit);

  const categories = await getPopularCategories();

  return (
    <div className="bg-white font-sans text-black min-h-screen">
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col lg:flex-row gap-12">
        {/* Main Content Area */}
        <div className="w-full lg:w-[65%]">
          <div className="flex flex-col gap-6">
            <ArticleList articles={articles as any} />
            
            {/* Navigasi Paging Diletakkan di Bawah List */}
            <Pagination currentPage={page} totalPages={totalPages} />
          </div>
        </div>
        <Sidebar categories={categories} />
      </main>
    </div>
  );
}
