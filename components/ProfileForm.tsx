"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/app/actions/user";

export default function ProfileForm({ user }: { user: any }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    setError("");
    setSuccess(false);

    startTransition(async () => {
      const res = await updateProfile(formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccess(true);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 border border-gray-100 rounded-2xl shadow-sm mt-8">
      {error && <div className="bg-red-50 text-red-600 p-4 rounded mb-6 text-sm ">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 p-4 rounded mb-6 text-sm">Profil berhasil diperbarui! Perubahan nama akan otomatis terlihat.</div>}

      <div className="flex flex-col sm:flex-row gap-8 mb-8">
        <div className="shrink-0 flex flex-col items-center gap-4">
           {/* Preview Avatar Client Component */}
           <div className="w-32 h-32 rounded-full overflow-hidden border border-gray-100 shadow-sm bg-gray-50 flex items-center justify-center relative">
             <img 
               src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
               alt={user.name} 
               className="object-cover w-full h-full"
             />
           </div>
        </div>

        <div className="flex-1 space-y-6">
           <div>
             <label className="block font-medium text-sm mb-2 text-gray-700">Nama Tampilan</label>
             <input type="text" name="name" defaultValue={user.name} required className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-black transition-colors" />
           </div>

           <div>
             <label className="block font-medium text-sm mb-2 text-gray-700">URL Foto Profil</label>
             <input type="url" name="image" defaultValue={user.image || ""} placeholder="https://..." className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-black transition-colors text-sm" />
             <p className="text-xs text-gray-400 mt-2">Masukkan tautan URL gambar avatar kesukaan Anda. Jika kosong, avatar acak akan dibuat.</p>
           </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-50">
         <button type="submit" disabled={isPending} className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 disabled:opacity-50 transition-colors font-medium">
           {isPending ? "Menyimpan..." : "Simpan Perubahan"}
         </button>
      </div>
    </form>
  );
}
