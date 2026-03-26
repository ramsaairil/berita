"use client";

import { Menu, Search, Instagram, Twitter, PenSquare, LogOut, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { logoutAction } from "@/app/actions/auth";
import { usePathname } from "next/navigation";

export default function Navbar({ user }: { user?: any }) {
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/register") return null;

  const isAdmin = user?.role === "ADMIN";

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between w-full h-[65px] px-6 bg-white border-b border-gray-100 font-sans">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center group">
          <span className="font-serif text-[32px] font-bold tracking-tighter text-black group-hover:text-gray-800 transition-colors">
            Berita.
          </span>
        </Link>
        <div className="hidden md:flex flex-1 items-center bg-[#f9f9f9] rounded-full px-4 py-2.5 ml-4 w-full max-w-xs hover:bg-gray-100 transition-colors">
          <Search className="w-5 h-5 text-gray-400 shrink-0" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent border-none outline-none text-[15px] ml-3 w-full text-black placeholder-gray-500"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 sm:gap-6">
        {isAdmin && (
          <Link href="/write" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors" aria-label="Write Article">
             <PenSquare className="w-5 h-5" strokeWidth={1.5} />
             <span className="hidden sm:inline text-[14px]">Tulis</span>
          </Link>
        )}
        <Link href="#" className="hidden sm:block text-gray-600 hover:text-black transition-colors" aria-label="Instagram">
          <Instagram className="w-[22px] h-[22px]" strokeWidth={1.5} />
        </Link>
        <Link href="#" className="hidden sm:block text-gray-600 hover:text-black transition-colors" aria-label="X (Twitter)">
          <Twitter className="w-[22px] h-[22px]" strokeWidth={1.5} />
        </Link>
        
        {user ? (
           <div className="flex items-center gap-4 border-l border-gray-200 pl-4 sm:pl-5">
             <Link href="/profile" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 relative shrink-0 flex items-center justify-center">
                  <img src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} className="object-cover w-full h-full" />
                </div>
                <span className="text-[14px] font-medium hidden sm:block truncate max-w-[100px]">{user.name}</span>
             </Link>
             <form action={logoutAction}>
               <button type="submit" className="flex items-center justify-center p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-red-600 transition-colors" aria-label="Logout">
                  <LogOut className="w-[18px] h-[18px]" strokeWidth={1.5} />
               </button>
             </form>
           </div>
        ) : (
          <Link href="/login" className="flex items-center justify-center bg-black text-white px-5 py-2 rounded-full text-[14px] font-medium hover:bg-gray-900 transition-colors">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
