"use client";

import React, { useMemo, useEffect, useCallback } from "react";
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

const MAX_BATCH_SIZE = 50;

const PostGrid: React.FC<PostGridProps> = ({ data, loading, error, user }) => {
  const memoizedData = useMemo(() => data, [data]);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const fetchLikeData = useCallback(
    async (postIds: number[]) => {
      if (!postIds.length || !user) return;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        const chunks = [];
        for (let i = 0; i < postIds.length; i += MAX_BATCH_SIZE) {
          chunks.push(postIds.slice(i, i + MAX_BATCH_SIZE));
        }

        const results = await Promise.all(
          chunks.map(async (chunk) => {
            const response = await fetch("/api/post/batch-like-data", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ids: chunk }),
              signal: abortControllerRef.current?.signal,
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(
                error.message || "Erro ao buscar dados de curtida",
              );
            }
            console.log("Likes fetched");
            return response.json() as Promise<LikeData[]>;
          }),
        );

        const allResults = results.flat();
        allResults.forEach(({ postId, liked, count }) => {
          const event = new CustomEvent("likeUpdate", {
            detail: { postId, liked, count },
          });
          window.dispatchEvent(event);
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Erro ao buscar dados de like em lote:", error);
        }
      } finally {
        abortControllerRef.current = null;
      }
    },
    [user],
  );

  useEffect(() => {
    if (!user || !memoizedData.length) return;

    // Garantindo que os IDs são números
    const postIds = memoizedData.map((post) => Number(post.id));
    fetchLikeData(postIds);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [memoizedData, user, fetchLikeData]);

  // Componentes de estado otimizados
  const renderLoadingState = useMemo(
    () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="bg-gray-200 dark:bg-zinc-800 h-60 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    ),
    [],
  );

  const renderErrorState = useMemo(
    () => (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    ),
    [error],
  );

  const renderEmptyState = useMemo(
    () => (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
          Nenhum post encontrado.
        </p>
        <p className="text-gray-500 dark:text-gray-500">
          Seja o primeiro a compartilhar algo!
        </p>
      </div>
    ),
    [],
  );

  // Renderização principal memoizada
  const renderPosts = useMemo(
    () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
        {memoizedData.map((post) => (
          <Posts.Card key={post.id} {...post} user={user} />
        ))}
      </div>
    ),
    [memoizedData, user],
  );

  if (loading) return renderLoadingState;
  if (error) return renderErrorState;
  if (!memoizedData.length) return renderEmptyState;
  return renderPosts;
};

export default React.memo(PostGrid);
