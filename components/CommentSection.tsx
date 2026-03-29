"use client";

import { useState, useTransition, useMemo } from "react";
import { addComment, toggleCommentLike, deleteComment } from "@/app/actions/interact";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThumbsUp, Trash2 } from "lucide-react";
import Image from "next/image";

type CommentType = {
  id: string;
  content: string;
  parentId?: string | null;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  commentLikes: { userId: string }[];
  replies?: CommentType[];
};

type FlatRepliedComment = Omit<CommentType, 'replies'> & {
  replyToName?: string;
  isDirectReplyToRoot?: boolean;
  replies?: FlatRepliedComment[];
};

export default function CommentSection({
  articleId,
  comments,
  isLoggedIn,
  currentUserId,
  totalCommentCount
}: {
  articleId: string;
  comments: CommentType[];
  isLoggedIn: boolean;
  currentUserId?: string;
  totalCommentCount: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState("");
  const router = useRouter();

  // Reconstruct 1-level deep tree from flat SQL array
  const topLevelComments = useMemo(() => {
    const map = new Map<string, CommentType>();
    
    comments.forEach(c => {
      map.set(c.id, { ...c, replies: [] });
    });

    const roots: CommentType[] = [];

    comments.forEach(c => {
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId)!.replies!.push(map.get(c.id)!);
      } else {
        roots.push(map.get(c.id)!);
      }
    });

    const flattenDescendants = (node: CommentType, rootId: string): FlatRepliedComment[] => {
      let flat: FlatRepliedComment[] = [];
      if (!node.replies) return flat;
      
      node.replies.sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      for (const child of node.replies) {
         flat.push({
           ...child,
           replyToName: node.author.name || "Seseorang",
           isDirectReplyToRoot: node.id === rootId
         });
         
         flat = flat.concat(flattenDescendants(child, rootId));
      }
      return flat;
    };

    const finalRoots = roots.map(root => {
       const flatReplies = flattenDescendants(root, root.id);
       flatReplies.sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
       
       return {
         ...root,
         replies: flatReplies
       } as FlatRepliedComment;
    });

    finalRoots.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return finalRoots;
  }, [comments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    startTransition(async () => {
      const res = await addComment(articleId, content);
      if (res?.error) {
        alert(res.error);
        router.push("/login");
      } else {
        setContent("");
      }
    });
  };

  const SingleComment = ({ c, isRoot = true }: { c: FlatRepliedComment, isRoot?: boolean }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [isActionPending, startAction] = useTransition();
    
    const initialIsLiked = currentUserId ? c.commentLikes.some(like => like.userId === currentUserId) : false;
    const initialLikeCount = c.commentLikes.length;
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likeCount, setLikeCount] = useState(initialLikeCount);

    const [visibleRepliesCount, setVisibleRepliesCount] = useState(2);
    const visibleReplies = c.replies ? c.replies.slice(0, visibleRepliesCount) : [];
    const hasMoreReplies = c.replies && c.replies.length > visibleRepliesCount;

    const handleReplySubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!replyContent.trim()) return;

      startAction(async () => {
         const res = await addComment(articleId, replyContent, c.id);
         if (res?.error) {
           alert(res.error);
         } else {
           setIsReplying(false);
           setReplyContent("");
           if (c.replies) setVisibleRepliesCount(c.replies.length + 1);
         }
      });
    };

    const handleLike = () => {
      if (!isLoggedIn) {
         router.push("/login");
         return;
      }
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

      startAction(async () => {
         const res = await toggleCommentLike(c.id);
         if (res?.error) {
            alert(res.error);
            setIsLiked(initialIsLiked);
            setLikeCount(initialLikeCount);
         }
      });
    };

    const handleDelete = () => {
      if (confirm("Apakah Anda yakin ingin menghapus komentar ini?")) {
        startAction(async () => {
          const res = await deleteComment(c.id);
          if (res?.error) {
            alert(res.error);
          }
        });
      }
    };

    return (
      <div className={`flex gap-3 sm:gap-4`}>
        <img 
          src={c.author.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author.name}`} 
          alt={c.author.name || "User"} 
          className="w-10 h-10 object-cover rounded-full shrink-0 border border-gray-100" 
        />
        <div className="flex-1">
           <div className="flex items-center gap-2 mb-1 flex-wrap">
             <h4 className="font-bold text-[15px]">{c.author.name}</h4>
             
             {!isRoot && !c.isDirectReplyToRoot && c.replyToName && (
               <span className="text-gray-500 text-[13px] flex items-center gap-1 font-medium bg-gray-50 px-2 py-0.5 rounded-md">
                 ▶ {c.replyToName}
               </span>
             )}

             <span className="text-gray-400 text-[13px]">
               {new Date(c.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} 
               {" · "} 
               {new Date(c.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
             </span>
           </div>
           <p className="text-[#242424] leading-relaxed text-[15px] mb-2 whitespace-pre-wrap">{c.content}</p>
           
           <div className="flex items-center gap-4 text-[13px] font-medium text-gray-500 mb-2">
              <button 
                onClick={handleLike} 
                disabled={isActionPending} 
                className={`hover:text-black flex items-center gap-1.5 transition-colors ${isLiked ? 'text-black' : ''}`}
              >
                 <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-black' : ''}`} /> {likeCount > 0 ? likeCount : ''}
              </button>
              
              <button onClick={() => {
                 if (!isLoggedIn) { router.push("/login"); return; }
                 setIsReplying(!isReplying)
              }} className="hover:text-black">
                 Balas
              </button>

              {isLoggedIn && currentUserId === c.author.id && (
                <button 
                  onClick={handleDelete}
                  disabled={isActionPending}
                  className="text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Hapus
                </button>
              )}
           </div>

           {isReplying && (
             <form onSubmit={handleReplySubmit} className="mt-4 mb-2 flex flex-col items-end bg-gray-50 rounded-lg p-3 border border-gray-100">
               <textarea
                 value={replyContent}
                 onChange={(e) => setReplyContent(e.target.value)}
                 disabled={isActionPending}
                 placeholder={`Membalas ${c.author.name}...`}
                 className="w-full bg-transparent p-2 min-h-[60px] mb-2 focus:outline-none text-[14px]"
                 required
                 autoFocus
               />
               <div className="flex gap-2">
                 <button type="button" onClick={() => setIsReplying(false)} className="px-4 py-1.5 text-sm text-gray-500 hover:text-black">Batal</button>
                 <button type="submit" disabled={isActionPending || !replyContent.trim()} className="bg-black text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors">
                   {isActionPending ? "Mengirim..." : "Kirim"}
                 </button>
               </div>
             </form>
           )}

           {isRoot && c.replies && c.replies.length > 0 && (
             <div className="mt-4 space-y-6">
                {visibleReplies.map(reply => (
                   <div key={reply.id} className="pt-2 sm:pl-2">
                     <SingleComment c={reply} isRoot={false} />
                   </div>
                ))}

                {hasMoreReplies && (
                  <div className="pt-2 sm:pl-2">
                    <button 
                      onClick={() => setVisibleRepliesCount(prev => prev + 5)}
                      className="text-[13px] font-bold text-gray-500 hover:text-black flex items-center gap-3 transition-colors text-left"
                    >
                      <span className="w-8 h-[1px] bg-gray-300"></span> 
                      Lihat {c.replies!.length - visibleRepliesCount} balasan lainnya
                    </button>
                  </div>
                )}
             </div>
           )}
        </div>
      </div>
    );
  };

  return (
    <div id="comments" className="mt-16 border-t border-gray-100 pt-10">
      <h3 className="text-2xl font-bold mb-8">Komentar ({totalCommentCount})</h3>

      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mb-10 flex flex-col items-end">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isPending}
            placeholder="Apa pendapat Anda tentang artikel ini?"
            className="w-full border border-gray-200 rounded-xl p-4 min-h-[100px] mb-3 focus:outline-none focus:border-black transition-colors"
            required
          />
          <button type="submit" disabled={isPending || !content.trim()} className="bg-black text-white px-6 py-2 rounded-full font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors">
            {isPending ? "Mengirim..." : "Kirim Komentar"}
          </button>
        </form>
      ) : (
        <div className="bg-gray-50 p-6 rounded-xl flex items-center justify-between mb-10 border border-gray-100">
          <p className="text-gray-600 font-medium whitespace-break-spaces truncate max-w-[60%]">
            Mendaftar untuk ikut ambil bagian.
          </p>
          <Link href="/login" className="bg-white border border-gray-300 text-black px-6 py-2 rounded-full hover:bg-gray-50 transition-colors font-medium">
            Masuk Komen
          </Link>
        </div>
      )}

      {topLevelComments.length > 0 ? (
        <div className="space-y-10">
          {topLevelComments.map((c) => (
            <SingleComment key={c.id} c={c} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-10 bg-gray-50 rounded-xl border border-gray-100">Jadilah yang pertama memberikan pendapat untuk artikel ini.</p>
      )}
    </div>
  );
}
