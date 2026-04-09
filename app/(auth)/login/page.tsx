"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();

  // Handle URL query parameters without forcing the entire page into suspense boundary statically
  // Usually wrap in Suspense but since this is client navigation, a simple check is fine window.location.search
  const isRegistered = typeof window !== 'undefined' && window.location.search.includes('registered=true');

  async function clientAction(formData: FormData) {
    setPending(true);
    setError("");
    try {
      const result = await loginAction(formData);
      if (result?.error) {
         setError(result.error);
      } else if (result?.success) {
         router.push("/");
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
        <h1 className="text-4xl font-serif font-bold text-center mb-10 tracking-tight">Selamat Datang.</h1>
        
        {isRegistered && !error && (
          <div className="bg-green-50 text-green-700 p-3 rounded mb-6 text-sm text-center border border-green-200">
            Pendaftaran berhasil! Silakan masuk dengan akun baru Anda.
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form action={clientAction} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" name="email" required className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors" placeholder="Masukkan email" />
          </div>
          <div className="pb-4">
            <label className="block text-sm font-medium mb-1">Kata Sandi</label>
            <input type="password" name="password" required className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors" placeholder="Masukkan kata sandi" />
          </div>
          
          <button type="submit" disabled={pending} className="w-full bg-black text-white py-3 rounded-full font-medium hover:bg-gray-900 transition-colors disabled:opacity-50">
            {pending ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="text-center text-sm text-[#242424] mt-8">
          Belum punya akun? <Link href="/register" className="text-black font-semibold hover:underline">Daftar sekarang</Link>
        </p>
      </div>
    </div>
  );
}
