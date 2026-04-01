import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-black text-white mt-16">
      {/* Top border accent */}
      <div className="h-1 w-full bg-[#e62000]" />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Brand */}
          <div>
            <span className="font-serif text-[26px] font-bold tracking-tight">
              <span className="font-normal text-gray-400">Portal</span>
              <span className="text-white"> Berita</span>
            </span>
            <p className="text-gray-400 text-[13px] mt-1">
              Portal berita independen & terpercaya.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-semibold text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <a href="#" className="hover:text-white transition-colors">Tentang</a>
            <a href="#" className="hover:text-white transition-colors">Privasi</a>
            <a href="#" className="hover:text-white transition-colors">Kontak</a>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-[12px] text-gray-600">
          © {new Date().getFullYear()} Portal Berita. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
