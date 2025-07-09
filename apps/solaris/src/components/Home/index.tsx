"use client";
import dynamic from "next/dynamic";
import React, { useMemo } from "react";

const Sidebar = dynamic(() => import("../Sidebar"));
const CreatePost = dynamic(() => import("../CreatePost"));
const WhoFollowList = dynamic(() => import("../WhoToFollowList"));

import { Posts } from "@/components/Posts";
import { Post, PostWithCount } from "@/schemas/post";
import { useAuth } from "@/contexts/auth/AuthContext";
import { useInfiniteQuery } from "@tanstack/react-query";
import { WhoFollowType } from "../WhoToFollowList";

const whotofollow: WhoFollowType[] = [
  {
    name: "Mari Albino",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b332c5c8?w=40&h=40&fit=crop&crop=face",
  },
  {
    name: "Xbvv Zx",
    avatar:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=404&auto=format&fit=crop&crop=face",
  },
  {
    name: "Marliza Albino",
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=40&h=40&fit=crop&crop=face",
  },
  {
    name: "Pedro",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
  },
];

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

export default function HomeForm({ initialPages }: HomeFormProps) {
  const { isAuthenticated, user } = useAuth();

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
    <div className="min-h-screen dark:bg-black bg-orange-50 dark:text-white text-orange-700">
      <div className="grid grid-cols-1 lg:grid-cols-[250px,1fr,250px] gap-4 max-w-7xl mx-auto pt-4 lg:pt-16">
        <aside className="hidden lg:block">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <Sidebar />
          </div>
        </aside>

        <main className="col-span-1 lg:col-span-1 px-2 sm:px-4 py-4">
          <div className="max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto space-y-4 sm:space-y-6">
            <CreatePost />
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
                className="w-full py-2 rounded bg-orange-600 text-white hover:bg-orange-700 transition"
              >
                {isFetchingNextPage ? "Carregando..." : "Carregar mais"}
              </button>
            )}
          </div>
        </main>

        <aside className="hidden lg:block">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <WhoFollowList whotofollow={whotofollow} />
          </div>
        </aside>
      </div>
    </div>
  );
}
