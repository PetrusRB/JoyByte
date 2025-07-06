"use client";

import React, { useMemo, useEffect } from "react";

import { PostWithCount } from "@/schemas/post";
import { User } from "@/schemas/user";
import { LikeData } from "@/routes/post/posts.router";
import { Posts } from "..";

type PostGridProps = {
  data: PostWithCount[];
  loading: boolean;
  error: string | null;
  user: User | null;
};

const PostGrid: React.FC<PostGridProps> = ({ data, loading, error, user }) => {
  const memoizedData = useMemo(() => data, [data]);

  useEffect(() => {
    if (!user || !data.length) return;

    const postIds = data.map((post) => post.id);

    // Initial batch fetch
    fetch("/api/post/batch-like-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: postIds }),
    })
      .then(async (res): Promise<LikeData[]> => {
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Erro ao buscar dados de curtida");
        }
        return res.json();
      })
      .then((results) => {
        results.forEach(({ postId, liked, count }) => {
          const event = new CustomEvent("likeUpdate", {
            detail: { postId, liked, count },
          });
          window.dispatchEvent(event);
        });
      })
      .catch((error) => {
        console.error("Erro ao buscar dados de like em lote:", error);
      });
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="bg-gray-200 dark:bg-zinc-800 h-60 rounded-2xl"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!memoizedData.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
          Nenhum post encontrado.
        </p>
        <p className="text-gray-500 dark:text-gray-500">
          Seja o primeiro a compartilhar algo!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
      {memoizedData.map((post) => (
        <Posts.Card key={post.id} {...post} user={user} />
      ))}
    </div>
  );
};

export default PostGrid;
