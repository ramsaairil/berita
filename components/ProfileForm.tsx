"use client";

import { useState, useTransition, ChangeEvent } from "react";
import { updateProfile } from "@/app/actions/user";

export default function ProfileForm({ user }: { user: any }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Ukuran gambar tidak boleh melebihi 5MB.");
        e.target.value = "";
        return;
      }
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

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
      {error && <div className="bg-red-50 text-red-600 p-4 rounded mb-6 text-sm font-medium">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 p-4 rounded mb-6 text-sm font-medium">Profil berhasil diperbarui! Perubahan identitas akan otomatis terlihat.</div>}

      <div className="flex flex-col sm:flex-row gap-8 mb-8">
        <div className="shrink-0 flex flex-col items-center gap-4">
           {/* Preview Avatar Client Component */}
           <div className="w-32 h-32 rounded-full overflow-hidden border border-gray-200 shadow-sm bg-gray-50 flex items-center justify-center relative">
             <img 
               src={previewUrl || user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
               alt={user.name} 
               className="object-cover w-full h-full"
             />
           </div>
        </div>

        <div className="flex-1 space-y-6">
           <div>
             <label className="block font-semibold text-[14px] mb-2 text-gray-800">Nama Lengkap</label>
             <input type="text" name="name" defaultValue={user.name} required className="w-full border border-gray-300 rounded-lg p-3 text-[14px] focus:outline-none focus:border-[#0d88b5] focus:ring-1 focus:ring-[#0d88b5] transition-all" />
           </div>

           <div>
             <label className="block font-semibold text-[14px] mb-2 text-gray-800">Unggah Foto Profil</label>
             <input 
                type="file" 
                name="image" 
                accept="image/png, image/jpeg, image/webp" 
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-[14px] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[13px] file:font-semibold file:bg-[#ebf5fa] file:text-[#0d88b5] hover:file:bg-[#d0eefc] focus:outline-none transition-all cursor-pointer bg-white" 
             />
             <p className="text-[13px] text-gray-500 mt-2 font-medium">Format: JPG, PNG, WEBP. Maksimal ukuran gambar: 5MB.</p>
           </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-100">
         <button type="submit" disabled={isPending} className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-900 focus:ring-4 focus:ring-gray-200 disabled:opacity-50 transition-all font-semibold text-[14px] shadow-sm">
           {isPending ? "Menyimpan Dokumen..." : "Simpan Perubahan"}
         </button>
      </div>
    </form>
  );
}
