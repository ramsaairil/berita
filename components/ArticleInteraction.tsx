"use client";

import { useTransition, useState } from "react";
import { toggleLike, toggleBookmark } from "@/app/actions/interact";
import { useRouter } from "next/navigation";
import { ThumbsUp, MessageSquare, Link as LinkIcon, Bookmark } from "lucide-react";

export default function ArticleInteraction({
  articleId,
  initialLikes,
  initialIsLiked,
  initialIsBookmarked,
  commentCount
}: {
  articleId: string;
  initialLikes: number;
  initialIsLiked: boolean;
  initialIsBookmarked: boolean;
  commentCount: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const router = useRouter();

  const handleLike = () => {
    // Optimistic Update
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    setIsLiked(!isLiked);

    startTransition(async () => {
       const res = await toggleLike(articleId);
       if (res?.error) {
          setLikes(initialLikes);
          setIsLiked(initialIsLiked);
          alert(res.error);
          router.push("/login");
       }
    });
  };

  const handleBookmark = () => {
    // Optimistic Update
    setIsBookmarked(!isBookmarked);

    startTransition(async () => {
      const res = await toggleBookmark(articleId);
      if (res?.error) {
        setIsBookmarked(initialIsBookmarked);
        alert(res.error);
        router.push("/login");
      }
    });
  };

  return (
    <div className="border-y border-gray-100 py-3 flex items-center justify-between mb-10">
      <div className="flex items-center gap-6 text-gray-500">
         <button onClick={handleLike} disabled={isPending} className={`flex items-center gap-2 transition-colors ${isLiked ? 'text-black font-bold' : 'hover:text-black'}`}>
            <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-black' : ''}`} /> {likes}
         </button>
         <button onClick={() => {
            const el = document.getElementById("comments");
            el?.scrollIntoView({ behavior: "smooth" });
         }} className="hover:text-black flex items-center gap-2">
            <MessageSquare className="w-5 h-5" strokeWidth={1.5} /> {commentCount}
         </button>
      </div>
      <div className="flex items-center gap-4 text-gray-500">
         <button 
           onClick={() => {
             navigator.clipboard.writeText(window.location.href);
             alert("Tautan berhasil disalin!");
           }}
           className="hover:text-black p-2 rounded-full hover:bg-gray-50 transition-all" 
           title="Salin Tautan"
         >
           <LinkIcon className="w-5 h-5" strokeWidth={1.5} />
         </button>
         <button 
           onClick={handleBookmark} 
           disabled={isPending}
           className={`p-2 rounded-full hover:bg-gray-50 transition-all ${isBookmarked ? 'text-[#0d88b5]' : 'hover:text-black'}`}
           title={isBookmarked ? "Hapus Simpanan" : "Simpan Berita"}
         >
           <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-[#0d88b5]' : ''}`} strokeWidth={1.5} />
         </button>
      </div>
    </div>
  );
}
