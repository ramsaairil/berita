import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-120px)] max-w-[1336px] mx-auto w-full px-4 sm:px-6 py-8 gap-8">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 sticky top-[100px]">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">
            Admin Menu
          </h2>
          <nav className="flex flex-col gap-1">
            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 text-black font-medium transition-colors"
            >
              <Users className="w-5 h-5 text-gray-500" />
              Kelola User
            </Link>
            {/* Future admin links can go here */}
          </nav>
        </div>
      </aside>

      {/* Admin Main Content */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
