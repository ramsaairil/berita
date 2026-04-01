import Link from "next/link";
import { Prisma } from "@prisma/client";
import TrendingWidget from "./TrendingWidget";
import { getCategoryColor } from "@/lib/categoryColors";

type Category = Prisma.CategoryGetPayload<{}>;

export default function Sidebar({ categories }: { categories: Category[] }) {
  return (
    <aside className="hidden lg:block w-[35%] shrink-0">
      <div className="flex flex-col gap-8 sticky top-24">
        {/* Trending Widget */}
        <TrendingWidget />

        {/* Categories */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 shrink-0">
              Kategori
            </h2>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="flex flex-col gap-0 divide-y divide-gray-100">
            {categories.length > 0 ? (
              categories.map((cat) => {
                const color = getCategoryColor(cat.name);
                return (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="group flex items-center gap-3 py-3 hover:pl-1 transition-all duration-200"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[14px] font-bold text-gray-700 group-hover:text-black transition-colors">
                      {cat.name}
                    </span>
                  </Link>
                );
              })
            ) : (
              <p className="text-gray-400 text-sm">Belum ada kategori.</p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
