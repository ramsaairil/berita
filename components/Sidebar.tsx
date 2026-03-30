import Link from "next/link";
import { Prisma } from "@prisma/client";
import TrendingWidget from "./TrendingWidget";

type Category = Prisma.CategoryGetPayload<{}>;

export default function Sidebar({ categories }: { categories: Category[] }) {
  return (
    <div className="hidden lg:block w-[35%] pl-8">
      <div className="flex flex-col gap-6 sticky top-24">
        {/* Real-Time Live Widget (Dipindah ke atas) */}
        <TrendingWidget />

        {/* Categories Block (Dipindah ke bawah) */}
        <div className="bg-white rounded-lg p-6 sm:p-8 border border-gray-200 shadow-sm">
          <h2 className="text-[16px] font-bold mb-6">Kategori Populer</h2>
          <div className="flex flex-wrap gap-2">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="bg-gray-50 hover:bg-gray-100 transition-colors text-black px-4 py-2 rounded-full text-[14px] border border-gray-100"
                >
                  {cat.name}
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Belum ada kategori.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
