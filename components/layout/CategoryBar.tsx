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
        <div className="flex items-center gap-6 overflow-x-auto pt-4 pb-0 no-scrollbar scroll-smooth">
          {categories.map((cat) => {
            const color = getCategoryColor(cat.name);
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group flex items-center gap-2 shrink-0 transition-opacity hover:opacity-80"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[13px] font-bold text-gray-700 uppercase tracking-wide group-hover:text-black transition-colors whitespace-nowrap">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
