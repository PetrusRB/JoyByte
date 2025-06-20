"use client";

import Sidebar from "../Sidebar";
import CreatePost from "../CreatePost";
import PostGrid from "../Posts";
import ContactsList from "../ContactList";
import { Post } from "@/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import ky from "ky";

const contacts = [
  {
    name: "Ezekiel Pinheiro",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
  },
  {
    name: "Mari Albino",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b332c5c8?w=40&h=40&fit=crop&crop=face",
  },
  {
    name: "Eduarda Oliveira",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
  },
  {
    name: "Xbvv Zx",
    avatar:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=404&auto=format&fit=crop=face",
  },
  {
    name: "Anna Vitoria",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=404&auto=format&fit=crop=face",
  },
  {
    name: "Marliza Albino",
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=40&h=40&fit=crop&crop=face",
  },
  {
    name: "Cleber Souza",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
  },
  {
    name: "Pedro",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
  },
  {
    name: "Celia Ferreira",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face",
  },
];

// Simulação de uma API paginada
const fetchPage = async (
  page: number,
): Promise<{ posts: Post[]; nextPage: number | null }> => {
  const res = await ky
    .get("/api/post/get", { searchParams: { page, limit: 5 } })
    .json<{ data: Post[] }>();

  // Simula o final da paginação
  const hasMore = res.data.length === 5;
  return {
    posts: res.data,
    nextPage: hasMore ? page + 1 : null,
  };
};

export default function HomeForm() {
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
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const allPosts = data?.pages.flatMap((p) => p.posts) || [];

  return (
    <div className="min-h-screen dark:bg-black bg-orange-50 dark:text-white text-orange-700">
      <div className="grid grid-cols-1 lg:grid-cols-[250px,1fr,250px] gap-4 max-w-7xl mx-auto pt-4 lg:pt-16">
        {/* Left Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <Sidebar />
          </div>
        </aside>

        {/* Main Content */}
        <main className="col-span-1 lg:col-span-1 px-2 sm:px-4 py-4">
          <div className="max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto space-y-4 sm:space-y-6">
            <CreatePost />
            <PostGrid
              data={allPosts}
              loading={isFetching && !data}
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

        {/* Right Sidebar - Contacts */}
        <aside className="hidden lg:block">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <ContactsList contacts={contacts} />
          </div>
        </aside>
      </div>
    </div>
  );
}
