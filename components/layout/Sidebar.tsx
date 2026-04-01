import Link from "next/link";
import { Prisma } from "@prisma/client";
import TrendingWidget from "@/components/features/articles/TrendingWidget";
import { getCategoryColor } from "@/lib/categoryColors";

type Category = Prisma.CategoryGetPayload<{}>;

export default function Sidebar({ categories }: { categories: Category[] }) {
  return (
    <aside className="hidden lg:block w-[35%] shrink-0">
      <div className="flex flex-col gap-8 sticky top-24">
        {/* Trending Widget */}
        <TrendingWidget />
      </div>
    </aside>
  );
}
