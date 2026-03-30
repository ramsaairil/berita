"use client";

import { Menu, Search, PenSquare, LogOut, User, Bookmark, X, Newspaper } from "lucide-react";
import Link from "next/link";
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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      if (isSidebarOpen && !isMobile) {
        mainContent.style.paddingLeft = "280px";
      } else {
        mainContent.style.paddingLeft = "0px";
      }
    }

    if (isSidebarOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      if (mainContent) mainContent.style.paddingLeft = "0px";
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen, isMobile]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname === "/login" || pathname === "/register") return null;

  const isAdmin = user?.role === "ADMIN";

  return (
    <>
      <nav className={`sticky top-0 z-40 bg-white font-sans transition-all duration-200 ${isScrolled ? 'border-b border-gray-100 shadow-sm' : 'border-b border-gray-100'}`}>
        <div className="flex items-center justify-between h-[57px] max-w-[1336px] mx-auto px-4 sm:px-6">
          {/* Left Section */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Toggle Menu"
            >
              {isSidebarOpen ? (
                <X className="w-6 h-6 text-gray-700" strokeWidth={1.5} />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" strokeWidth={1.5} />
              )}
            </button>
            <Link href="/" className="flex items-center shrink-0">
              <span className="font-serif text-[28px] sm:text-[32px] font-bold tracking-tighter text-black hover:text-gray-800 transition-colors">
                Berita
              </span>
            </Link>
            <div className="hidden md:block ml-4 w-64">
              <SearchBar />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setIsMobileSearchOpen(true)}
              className="md:hidden text-gray-600 hover:text-black transition-colors"
              aria-label="Search"
            >
              <Search className="w-6 h-6" strokeWidth={1.5} />
            </button>

            {user && <NotificationDropdown />}

            {user ? (
              <div className="relative flex items-center">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center hover:opacity-80 transition-opacity"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                    <img src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} className="object-cover w-full h-full" />
                  </div>
                </button>

                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsProfileOpen(false)} />
                    <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white border border-gray-100 rounded-lg shadow-xl z-50 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-4 py-3 border-b border-gray-50 mb-1">
                        <p className="text-[14px] font-medium text-black truncate">{user.name}</p>
                        <p className="text-[13px] text-gray-500 truncate">{user.email || "User"}</p>
                      </div>

                      <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-[14px] text-gray-700 hover:text-black hover:bg-gray-50 transition-colors">
                        <User className="w-4 h-4 text-gray-500" />
                        Profile
                      </Link>
                      {isAdmin ? (
                        <Link href="/my-articles" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-[14px] text-gray-700 hover:text-black hover:bg-gray-50 transition-colors">
                          <Newspaper className="w-4 h-4 text-gray-500" />
                          Artikel
                        </Link>
                      ) : (
                        <Link href="/bookmarks" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-[14px] text-gray-700 hover:text-black hover:bg-gray-50 transition-colors">
                          <Bookmark className="w-4 h-4 text-gray-500" />
                          Library
                        </Link>
                      )}

                      <div className="h-px bg-gray-100 my-1 font-light" />

                      <form action={logoutAction}>
                        <button type="submit" className="flex items-center gap-3 w-full px-4 py-2 text-[14px] text-gray-700 hover:text-black hover:bg-gray-50 transition-colors text-left">
                          <LogOut className="w-4 h-4 text-gray-500" />
                          Sign out
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4 sm:gap-6">
                <Link href="/login" className="hidden sm:block text-[14px] font-normal text-gray-600 hover:text-black transition-colors">
                  Sign in
                </Link>
                <Link href="/login" className="bg-black text-white px-4 py-2 rounded-full text-[14px] font-medium hover:bg-gray-800 transition-colors">
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <SearchBar onMobileClose={() => setIsMobileSearchOpen(false)} />
      )}

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed left-0 right-0 bottom-0 top-[57px] bg-transparent z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <div
        className={`fixed top-[57px] left-0 h-[calc(100vh-57px)] w-[280px] bg-white z-30 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out border-r border-gray-100 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
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
                    Library
                  </Link>
                )}
              </>
            ) : (
              <Link href="/login" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl bg-black text-white font-bold text-[15px] transition-shadow hover:shadow-lg mt-2 mx-2">
                Sign in
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
                Sign out
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
