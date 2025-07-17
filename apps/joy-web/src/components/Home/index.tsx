"use client";
import dynamic from "next/dynamic";
import React, { useMemo } from "react";

const CreatePost = dynamic(() => import("../CreatePost"));

import { Posts } from "@/components/Posts";
import { Post, PostWithCount } from "@/schemas";
import { useAuth } from "@/contexts/auth/AuthContext";
import { useInfiniteQuery } from "@tanstack/react-query";
import WhoToFollowList from "../WhoToFollowList";
import { useTranslations } from "next-intl";

type HomeFormProps = {
  initialPages?: { posts: PostWithCount[]; nextPage: number | null }[];
};

// API paginada com shape correto
const fetchPage = async (
  page: number,
): Promise<{ posts: PostWithCount[]; nextPage: number | null }> => {
  const PAGE_SIZE = 5;
  const offset = (page - 1) * PAGE_SIZE;

  const res = await fetch(`/api/post/get?limit=${PAGE_SIZE}&offset=${offset}`);
  if (!res.ok) {
    throw new Error("Erro ao buscar posts");
  }
  const json: Post[] = await res.json();

  // Map posts to PostWithCount, setting initialLikeCount to 0
  // Like data will be fetched by PostGrid's useEffect
  const postsWithCounts: PostWithCount[] = json.map((post) => ({
    ...post,
    likeCount: 0, // Placeholder, updated by PostGrid
    initialLikeCount: 0, // Placeholder, updated by PostGrid
    user: null, // Will be set by PostGrid
  }));

  const hasMore = json.length === PAGE_SIZE;
  return { posts: postsWithCounts, nextPage: hasMore ? page + 1 : null };
};

function HomeForm({ initialPages }: HomeFormProps) {
  const { isAuthenticated, user } = useAuth();
  const t = useTranslations("User");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    error,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam = 1 }) => fetchPage(pageParam),
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: isAuthenticated,
    initialData: initialPages
      ? { pages: initialPages, pageParams: [1] }
      : undefined,
  });
  const allPosts: PostWithCount[] = useMemo(
    () => (data ? data.pages.flatMap((p) => p.posts) : []),
    [data],
  );

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Coluna principal com posts */}
        <div className="lg:col-span-6">
          {/* CreatePost com sticky no topo */}
          {user && (
            <div className="top-16 z-10 mb-6 bg-orange-50 dark:bg-black pb-4">
              <CreatePost />
            </div>
          )}

          <div className="space-y-6">
            {/* Posts */}
            <Posts.Section
              data={allPosts}
              loading={isFetching && !data}
              user={user}
              error={error?.message ?? null}
            />

            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full py-3 rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 transition-all duration-200"
              >
                {isFetchingNextPage ? "Carregando..." : "Carregar mais"}
              </button>
            )}
          </div>
        </div>

        {/* Sidebar direita com sticky */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto hidden lg:block scrollbar-hide">
            <WhoToFollowList translation={t} />
          </div>
        </div>
      </div>
    </>
  );
}

export default React.memo(HomeForm);
