import Link from "next/link";
import { Prisma } from "@prisma/client";

type Category = Prisma.CategoryGetPayload<{}>;

export default function Sidebar({ categories }: { categories: Category[] }) {
  return (
    <div className="hidden lg:block w-[35%] border-l border-gray-100 pl-10">
      <h2 className="text-[16px] font-bold mb-6">Kategori Populer</h2>
      <div className="flex flex-wrap gap-2">
        {categories.length > 0 ? (
          categories.map((cat) => (
            <Link 
              key={cat.id} 
              href={`/category/${cat.slug}`}
              className="bg-gray-100 hover:bg-gray-200 transition-colors text-black px-4 py-2 rounded-full text-[14px]"
            >
              {cat.name}
            </Link>
          ))
        ) : (
          <p className="text-gray-500 text-sm">Belum ada kategori.</p>
        )}
      </div>
      
      <div className="mt-8 border-t border-gray-100 pt-6">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-gray-500">
            <Link href="#" className="hover:text-black">Help</Link>
            <Link href="#" className="hover:text-black">Status</Link>
            <Link href="#" className="hover:text-black">About</Link>
            <Link href="#" className="hover:text-black">Careers</Link>
            <Link href="#" className="hover:text-black">Press</Link>
          </div>
      </div>
    </div>
  );
}
