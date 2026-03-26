"use client";

import { useState } from "react";
import { registerAction } from "@/app/actions/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function clientAction(formData: FormData) {
    setPending(true);
    setError("");
    try {
      const result = await registerAction(formData);
      if (result?.error) {
         setError(result.error);
      } else if (result?.success) {
         router.push("/login?registered=true");
         router.refresh();
      }
    } catch(err) {
      setError("Terjadi kesalahan dari server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col justify-center items-center px-6 py-12 bg-white text-black">
      <div className="w-full max-w-sm">
        <h1 className="text-4xl font-serif font-bold text-center mb-10 tracking-tight">Bergabunglah.</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form action={clientAction} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
            <input type="text" name="name" required className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors" placeholder="Budi Santoso" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" name="email" required className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors" placeholder="nama@email.com" />
          </div>
          <div className="pb-4">
            <label className="block text-sm font-medium mb-1">Kata Sandi</label>
            <input type="password" name="password" required minLength={6} className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors" placeholder="Minimal 6 karakter" />
          </div>
          
          <button type="submit" disabled={pending} className="w-full bg-black text-white py-3 rounded-full font-medium hover:bg-gray-900 transition-colors disabled:opacity-50">
            {pending ? "Memproses..." : "Daftar Akun"}
          </button>
        </form>

        <p className="text-center text-sm text-[#242424] mt-8">
          Sudah punya akun? <Link href="/login" className="text-black font-semibold hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
