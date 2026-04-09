"use client";

import Image from "next/image";
import Link from "next/link";
import { getCategoryColor } from "@/lib/categoryColors";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HeroSlider({ articles }: { articles: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % articles.length);
  }, [articles.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? articles.length - 1 : prevIndex - 1
    );
  }, [articles.length]);

  // Autoplay
  useEffect(() => {
    if (articles.length <= 1) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [articles.length, nextSlide]);

  if (!articles || articles.length === 0) return null;

  return (
    <div className="mb-6 group">
      <div className="relative mb-5">
        <div className="grid">
        {articles.map((article, idx) => {
          const categoryColor = getCategoryColor(article.category.name);
          const isActive = idx === currentIndex;

          return (
            <div
              key={article.id}
              className={`col-start-1 row-start-1 transition-opacity duration-700 ease-in-out ${isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
            >
              <Link href={`/berita/${article.slug}`} className="block relative aspect-[4/3] sm:aspect-[16/9] w-full overflow-hidden group/slide rounded-lg shadow-sm">
                {/* Featured Image */}
                {article.featuredImg ? (
                  <Image
                    src={article.featuredImg}
                    fill
                    priority={idx === 0}
                    sizes="(max-width: 1024px) 100vw, 65vw"
                    alt={article.title}
                    className="object-cover group-hover/slide:scale-[1.03] transition-transform duration-[1.5s] ease-out"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 lg:p-10 text-white z-10">
                  {/* Category Label */}
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="inline-block px-3 py-1 text-[11px] font-black uppercase tracking-[0.15em] rounded-sm backdrop-blur-md bg-black/30"
                      style={{ color: categoryColor, borderLeft: `3px solid ${categoryColor}` }}
                    >
                      {article.category.name}
                    </span>
                  </div>

                  {/* Headline */}
                  <h1 className="font-serif text-[22px] sm:text-[28px] lg:text-[32px] font-bold leading-[1.2] text-white hover:text-gray-200 transition-colors duration-200 mb-2 sm:mb-3 line-clamp-2 drop-shadow-md">
                    {article.title}
                  </h1>

                  {/* Excerpt */}
                  {article.excerpt && (
                    <p className="hidden sm:block text-[15px] sm:text-[17px] text-gray-200 leading-relaxed max-w-3xl mb-4 sm:mb-5 line-clamp-2 drop-shadow">
                      {article.excerpt}
                    </p>
                  )}

                  {/* Byline */}
                  <div className="flex items-center gap-2 text-[12px] sm:text-[13px] text-gray-300 font-medium">
                    <span className="text-white drop-shadow">{article.author.name}</span>
                    <span>·</span>
                    <span className="drop-shadow">
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                        : "Draft"}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
        </div>

        {/* Navigation Buttons */}
        {articles.length > 1 && (
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-4 sm:px-6 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <button
              onClick={(e) => {
                e.preventDefault();
                prevSlide();
              }}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-black pointer-events-auto hover:bg-white transition-colors shadow-lg"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                nextSlide();
              }}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-black pointer-events-auto hover:bg-white transition-colors shadow-lg"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {/* Slide Indicators */}
      {articles.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {articles.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 transition-all duration-300 rounded-full ${idx === currentIndex ? "w-8 bg-black" : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
