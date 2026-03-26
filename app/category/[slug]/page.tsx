import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import ArticleList from "@/components/ArticleList";
import Sidebar from "@/components/Sidebar";
import { notFound } from "next/navigation";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

import { getPopularCategories } from "@/lib/categories";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug: slug },
  });

  if (!category) {
    notFound();
  }

  const articles = await prisma.article.findMany({
    where: {
      categoryId: category.id,
    },
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
          <div className="mb-8 border-b border-gray-100 pb-8">
             <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl font-serif">
                    #
                 </div>
                 <div>
                    <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
                    <p className="text-gray-500 mt-1">Topic · {articles.length} Articles</p>
                 </div>
             </div>
          </div>
          <div className="flex flex-col gap-12">
            <ArticleList articles={articles as any} />
          </div>
        </div>
        <Sidebar categories={categories} />
      </main>
    </div>
  );
}
