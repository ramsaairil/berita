"use client";

import { Menu, Search, PenSquare, LogOut, User, Bookmark, X, Newspaper } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { logoutAction } from "@/app/actions/auth";
import { usePathname } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import NotificationDropdown from "@/components/NotificationDropdown";
import { useState, useEffect } from "react";

export default function Navbar({ user, categories }: { user?: any, categories?: any[] }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isSidebarOpen && !isMobile) {
      document.body.style.transition = "margin-left 0.3s ease-in-out";
      document.body.style.marginLeft = "280px";
      document.body.style.overflowX = "hidden";
    } else {
      document.body.style.marginLeft = "0px";
      if (isSidebarOpen && isMobile) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }
    }
    return () => { 
      document.body.style.marginLeft = "0px";
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen, isMobile]);

  if (pathname === "/login" || pathname === "/register") return null;

  const isAdmin = user?.role === "ADMIN";

  return (
    <>
      <nav className="sticky top-0 z-40 flex items-center justify-between w-full h-[60px] sm:h-[65px] px-4 sm:px-6 bg-white border-b border-gray-100 font-sans shadow-sm transition-all duration-300">
        {/* Left Section */}
        <div className="flex items-center gap-1 sm:gap-4 flex-1">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Open Menu"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" strokeWidth={1.5} />
          </button>
          
          <Link href="/" className="flex items-center group shrink-0">
            <span className="font-serif text-[24px] sm:text-[32px] font-bold tracking-tighter text-black group-hover:text-gray-800 transition-all duration-300">
              Berita.
            </span>
          </Link>
          <div className="hidden lg:block ml-4 flex-1 max-w-xs">
            <SearchBar />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-6">
          <button 
            onClick={() => setIsMobileSearchOpen(true)}
            className="lg:hidden p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" strokeWidth={1.5} />
          </button>

          {isAdmin && (
            <Link href="/write" className="flex items-center gap-2 text-gray-600 hover:text-[#0d88b5] transition-colors" aria-label="Write Article">
               <PenSquare className="w-5 h-5" strokeWidth={1.5} />
               <span className="hidden md:inline text-[14px] font-medium">Tulis</span>
            </Link>
          )}
          
          {user && <NotificationDropdown />}
          
          {user ? (
             <div className="relative flex items-center gap-2 sm:gap-4 border-l border-gray-100 pl-2 sm:pl-5 ml-1 sm:ml-0">
               <button 
                 onClick={() => setIsProfileOpen(!isProfileOpen)}
                 className="flex items-center gap-2 hover:opacity-80 transition-opacity"
               >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 relative shrink-0 flex items-center justify-center border border-gray-200">
                    <img src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} className="object-cover w-full h-full" />
                  </div>
                  <span className="text-[14px] font-medium hidden md:block truncate max-w-[100px] text-gray-800">{user.name}</span>
               </button>

               {isProfileOpen && (
                 <>
                   <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsProfileOpen(false)} />
                   <div className="absolute right-0 top-[calc(100%+12px)] w-48 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                      <div className="px-4 py-2 border-b border-gray-50 mb-1">
                        <p className="text-[13px] font-bold text-black truncate">{user.name}</p>
                        <p className="text-[11px] text-gray-500 truncate">{user.email || "User"}</p>
                      </div>

                      <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-[14px] font-semibold text-gray-700 hover:bg-[#ebf5fa] hover:text-[#0d88b5] transition-colors group">
                        <User className="w-4 h-4 text-gray-400 group-hover:text-[#0d88b5]" />
                        Profile
                      </Link>
                      {isAdmin ? (
                        <Link href="/my-articles" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-[14px] font-semibold text-gray-700 hover:bg-[#ebf5fa] hover:text-[#0d88b5] transition-colors group">
                          <Newspaper className="w-4 h-4 text-gray-400 group-hover:text-[#0d88b5]" />
                          Artikel Saya
                        </Link>
                      ) : (
                        <Link href="/bookmarks" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-[14px] font-semibold text-gray-700 hover:bg-[#ebf5fa] hover:text-[#0d88b5] transition-colors group">
                          <Bookmark className="w-4 h-4 text-gray-400 group-hover:text-[#0d88b5]" />
                          Bookmark
                        </Link>
                      )}
                      
                      <div className="h-px bg-gray-100 my-1 mx-2" />
                      
                      <form action={logoutAction}>
                        <button type="submit" className="flex items-center gap-3 w-full px-4 py-2.5 text-[14px] font-semibold text-red-600 hover:bg-red-50 transition-colors text-left">
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </form>
                   </div>
                 </>
               )}
             </div>
          ) : (
            <Link href="/login" className="bg-black text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[13px] sm:text-[14px] font-medium hover:bg-gray-900 transition-all">
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <SearchBar onMobileClose={() => setIsMobileSearchOpen(false)} />
      )}

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <div 
        className={`fixed top-0 left-0 h-full w-[280px] bg-white z-[110] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out border-r border-gray-100 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
           {user ? (
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white relative shrink-0 shadow-sm border border-gray-200">
                   <img src={user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt={user?.name} className="object-cover w-full h-full" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="font-bold text-[16px] leading-tight text-black truncate">{user?.name}</h3>
                  <span className="text-[12px] font-medium text-gray-500 bg-gray-100 px-2 mt-1 rounded-md w-max">
                    {user?.role === "ADMIN" ? "Admin" : "User"}
                  </span>
                </div>
             </div>
           ) : (
             <div className="flex items-center gap-4">
               <div className="flex flex-col">
                 <h3 className="font-bold text-[18px] text-black">Selamat Datang</h3>
                 <p className="text-[13px] text-gray-500">Baca berita terbaru hari ini.</p>
               </div>
             </div>
           )}
           <button 
             onClick={() => setIsSidebarOpen(false)}
             className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
           >
             <X className="w-6 h-6" strokeWidth={1.5} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-6">
           {/* Section 1: Navigation/User */}
           <div className="flex flex-col gap-1">
             <Link href="/" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl hover:bg-gray-50 text-gray-700 font-bold text-[15px] transition-colors">
               Beranda
             </Link>
             {user ? (
               <>
                 <Link href="/profile" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl hover:bg-[#ebf5fa] hover:text-[#0d88b5] text-gray-700 font-semibold text-[15px] transition-colors group">
                   <User className="w-5 h-5 text-gray-400 group-hover:text-[#0d88b5]" strokeWidth={2} />
                   Profile
                 </Link>
                 {isAdmin ? (
                   <Link href="/my-articles" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl hover:bg-[#ebf5fa] hover:text-[#0d88b5] text-gray-700 font-semibold text-[15px] transition-colors group">
                     <Newspaper className="w-5 h-5 text-gray-400 group-hover:text-[#0d88b5]" strokeWidth={2} />
                     Artikel Saya
                   </Link>
                 ) : (
                   <Link href="/bookmarks" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl hover:bg-[#ebf5fa] hover:text-[#0d88b5] text-gray-700 font-semibold text-[15px] transition-colors group">
                     <Bookmark className="w-5 h-5 text-gray-400 group-hover:text-[#0d88b5]" strokeWidth={2} />
                     Bookmark
                   </Link>
                 )}
               </>
             ) : (
               <Link href="/login" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl bg-black text-white font-bold text-[15px] transition-shadow hover:shadow-lg mt-2 mx-2">
                 Login Ke Portal
               </Link>
             )}
           </div>

           {/* Section 2: Categories */}
           <div className="px-4">
              <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-4">Kategori Populer</h4>
              <div className="flex flex-col gap-3">
                {categories?.map((cat) => (
                  <Link 
                    key={cat.id} 
                    href={`/category/${cat.slug}`} 
                    onClick={() => setIsSidebarOpen(false)}
                    className="text-[15px] font-semibold text-gray-600 hover:text-black transition-colors"
                  >
                    # {cat.name}
                  </Link>
                ))}
              </div>
           </div>
        </div>

        {user && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
             <form action={logoutAction}>
               <button type="submit" className="flex items-center gap-3.5 w-full px-4 py-4 rounded-xl hover:bg-red-50 hover:text-red-700 text-red-600 font-bold text-[15px] transition-colors group">
                 <LogOut className="w-5 h-5" strokeWidth={2} />
                 Log Out
               </button>
             </form>
          </div>
        )}
      </div>
    </>
  );
}
