"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ArrowLeft, X } from "lucide-react";
import { searchArticles } from "@/app/actions/search";
import Link from "next/link";
import Image from "next/image";

type SearchResult = {
  id: string;
  slug: string;
  title: string;
  featuredImg: string | null;
};

export default function SearchBar({ onMobileClose }: { onMobileClose?: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (onMobileClose && !query) onMobileClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onMobileClose, query]);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length === 0) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      const res = await searchArticles(query);
      setResults(res);
      setIsSearching(false);
    };

    const delayDebounceFn = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const isModal = !!onMobileClose;

  return (
    <div
      ref={wrapperRef}
      className={`
        ${isModal ? 'fixed inset-0 z-[100] bg-white flex flex-col p-4 animate-in slide-in-from-top duration-300' : 'hidden md:flex flex-1 relative bg-[#f9f9f9] rounded-full px-4 py-2.5 ml-4 w-full max-w-xs hover:bg-gray-100 transition-colors'}
      `}
    >
      <div className={`flex items-center w-full ${isModal ? 'pb-4 border-b border-gray-100' : ''}`}>
        {isModal && (
          <button onClick={onMobileClose} className="p-2 -ml-2 mr-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
        )}
        <Search className="w-5 h-5 text-gray-400 shrink-0" strokeWidth={1.5} />
        <input
          type="text"
          placeholder="Cari berita..."
          autoFocus={isModal}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query.trim() && setIsOpen(true)}
          className="bg-transparent border-none outline-none text-[16px] ml-3 w-full text-black placeholder-gray-500"
        />
        {isModal && query && (
          <button onClick={() => setQuery("")} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {(isOpen || isModal) && query.trim().length > 0 && (
        <div className={`
          ${isModal ? 'flex-1 overflow-y-auto mt-2' : 'absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-[100] max-h-[400px] overflow-y-auto'}
        `}>
          {isSearching ? (
            <div className="p-5 text-center text-[13px] text-gray-500 font-medium animate-pulse">
              Mencari berita...
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col py-2">
              {results.map((article) => (
                <Link
                  key={article.id}
                  href={`/berita/${article.slug}`}
                  onClick={() => {
                    setIsOpen(false);
                    setQuery("");
                    if (onMobileClose) onMobileClose();
                  }}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group border-b border-gray-50 last:border-0"
                >
                  {article.featuredImg ? (
                    <div className="w-14 h-14 relative shrink-0 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                      <Image src={article.featuredImg} fill alt={article.title} className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 shrink-0 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                      <span className="text-gray-400 text-[10px] font-bold">NEWS</span>
                    </div>
                  )}
                  <div className="flex-1 flex flex-col justify-center">
                    <span className="text-[14px] font-bold text-black leading-snug line-clamp-2 group-hover:text-[#0d88b5] transition-colors">{article.title}</span>
                    <span className="text-[11px] text-[#0d88b5] font-medium mt-1">Baca Selengkapnya</span>
                  </div>
                </Link>
              ))}
              {!isModal && (
                <div className="px-4 py-2 mt-2 border-t border-gray-50 text-center">
                  <span className="text-[11px] text-gray-400 font-medium">Klik untuk membaca langsung</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-[14px] text-gray-500 font-medium">
              <Search className="w-12 h-12 text-gray-100 mx-auto mb-4" />
              Pencarian tidak ditemukan.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
