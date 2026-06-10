"use client";

import { useState } from "react";
import { changeUserRoleAction, deleteUserAction } from "@/app/actions/admin";
import { User as UserIcon, Shield, Trash2, ShieldAlert } from "lucide-react";

export default function UsersTable({ initialUsers, currentUserId }: { initialUsers: any[], currentUserId: string }) {
  const [users, setUsers] = useState(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, currentRole: string) => {
    setLoadingId(userId);
    setErrorMsg(null);
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    
    const result = await changeUserRoleAction(userId, newRole);
    
    if (result.error) {
      setErrorMsg(result.error);
    } else {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }
    setLoadingId(null);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus user ini? Aksi ini tidak dapat dibatalkan.")) return;
    
    setLoadingId(userId);
    setErrorMsg(null);
    
    const result = await deleteUserAction(userId);
    
    if (result.error) {
      setErrorMsg(result.error);
    } else {
      setUsers(users.filter(u => u.id !== userId));
    }
    setLoadingId(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-600 border-b border-red-100 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Bergabung</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Tidak ada pengguna ditemukan.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isCurrentUser = u.id === currentUserId;
                const isLoading = loadingId === u.id;
                
                return (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-gray-100">
                          <img 
                            src={u.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name || u.email}`} 
                            alt={u.name || 'User'} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-medium text-gray-900">{u.name || "Tanpa Nama"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role === 'ADMIN' ? <Shield className="w-3.5 h-3.5" /> : <UserIcon className="w-3.5 h-3.5" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(u.createdAt).toLocaleDateString("id-ID", {
                        year: "numeric", month: "short", day: "numeric"
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRoleChange(u.id, u.role)}
                          disabled={isLoading || isCurrentUser}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Ubah Role
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          disabled={isLoading || isCurrentUser}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Hapus User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
