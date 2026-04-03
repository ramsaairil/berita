"use client";

import Link from "next/link";
import { Prisma } from "@prisma/client";
import { getCategoryColor } from "@/lib/categoryColors";
import { usePathname } from "next/navigation";

type Category = Prisma.CategoryGetPayload<{}>;

export default function CategoryBar({ categories }: { categories: Category[] }) {
  const pathname = usePathname();

  const isNewsPage =
    pathname === "/" ||
    pathname.startsWith("/category") ||
    pathname.startsWith("/berita") ||
    pathname.startsWith("/search");

  if (!isNewsPage) return null;
  if (!categories || categories.length === 0) return null;

  return (
    <div id="category-bar" className="w-full -mb-4 relative z-10 transition-all duration-300">
      <div className="max-w-[1336px] mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 overflow-x-auto pt-4 pb-0 no-scrollbar scroll-smooth">
          {categories.map((cat) => {
            const isActive = pathname === `/category/${cat.slug}`;
            const color = getCategoryColor(cat.name);
            
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className={`px-4 py-1.5 rounded-full text-[13px] font-bold uppercase tracking-wide transition-all duration-300 whitespace-nowrap shrink-0 border ${
                  isActive 
                  ? "bg-black text-white border-black shadow-md scale-105" 
                  : "bg-white text-gray-600 border-gray-100 hover:border-gray-300 hover:text-black hover:bg-gray-50/50 hover:shadow-sm"
                }`}
                style={isActive ? { backgroundColor: 'black' } : {}}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
