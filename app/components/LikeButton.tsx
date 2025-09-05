"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";

type Props = {
  reportId: string;
  initialLiked: boolean;
  initialLikeCount: number;
};

export default function LikeButton({ reportId, initialLiked, initialLikeCount }: Props) {
  const [liked, setLiked] = useState<boolean>(initialLiked);
  const [likeCount, setLikeCount] = useState<number>(initialLikeCount);
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    if (isPending) return;
    const optimisticLiked = !liked;
    const optimisticCount = likeCount + (optimisticLiked ? 1 : -1);
    setLiked(optimisticLiked);
    setLikeCount(Math.max(0, optimisticCount));

    startTransition(async () => {
      try {
        const res = await fetch("/api/likes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");
        setLiked(Boolean(data.liked));
        if (typeof data.likeCount === "number") setLikeCount(data.likeCount);
      } catch {
        // revert optimistic
        setLiked(liked);
        setLikeCount(likeCount);
      }
    });
  };

  return (
    <button
      onClick={toggle}
      aria-label={liked ? "いいねを取り消す" : "いいね"}
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md border transition-colors ${liked ? "text-red-600 border-red-300 bg-red-50" : "text-gray-700 border-gray-300 hover:bg-gray-50"}`}
      disabled={isPending}
    >
      <Heart size={18} fill={liked ? "currentColor" : "none"} />
      <span className="text-sm">{likeCount}</span>
    </button>
  );
}


