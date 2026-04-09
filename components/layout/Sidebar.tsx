import Link from "next/link";
import TrendingWidget from "@/components/features/articles/TrendingWidget";
import { getCategoryColor } from "@/lib/categoryColors";

interface Category {
  id: string;
  name: string;
  slug: string;
}

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
