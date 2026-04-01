"use client";

import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between w-full pt-6 border-t border-gray-100 mt-4 mb-4">
      {currentPage > 1 ? (
        <Link 
          href={`/?page=${currentPage - 1}`}
          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-full text-[#242424] hover:bg-gray-50 hover:border-gray-300 transition-all font-bold text-sm shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          <span>Sebelumnya</span>
        </Link>
      ) : (
        <div className="flex items-center gap-2 px-6 py-2.5 bg-gray-50 border border-gray-100 rounded-full text-gray-400 font-bold text-sm cursor-not-allowed">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          <span>Sebelumnya</span>
        </div>
      )}

      <span className="text-sm text-gray-500 font-medium hidden sm:block">
        Halaman <span className="text-black font-bold">{currentPage}</span> dari {totalPages}
      </span>

      {currentPage < totalPages ? (
        <Link 
          href={`/?page=${currentPage + 1}`}
          className="flex items-center gap-2 px-6 py-2.5 bg-black border border-black rounded-full text-white hover:bg-gray-800 transition-all font-bold text-sm shadow-sm"
        >
          <span>Selanjutnya</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
        </Link>
      ) : (
        <div className="flex items-center gap-2 px-6 py-2.5 bg-gray-50 border border-gray-100 rounded-full text-gray-400 font-bold text-sm cursor-not-allowed">
          <span>Selanjutnya</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
        </div>
      )}
    </div>
  );
}
