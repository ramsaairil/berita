import { getUsersAction } from "@/app/actions/admin";
import UsersTable from "./UsersTable";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Kelola User - Admin Dashboard",
  description: "Manajemen pengguna Portal Berita",
};

export default async function AdminUsersPage() {
  const session = await getSession();
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const result = await getUsersAction();

  if (result.error || !result.users) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-red-100 shadow-sm text-center">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Gagal Memuat Data</h1>
        <p className="text-gray-500">{result.error || "Terjadi kesalahan saat mengambil data pengguna."}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kelola Pengguna</h1>
        <p className="text-gray-500 mt-1">Kelola hak akses dan akun pengguna yang terdaftar di Portal Berita.</p>
      </div>
      
      <UsersTable initialUsers={result.users} currentUserId={session.user.id} />
    </div>
  );
}
