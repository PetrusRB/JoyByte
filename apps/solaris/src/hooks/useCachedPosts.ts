import { Post } from "@/types";
import { useQuery } from "@tanstack/react-query";
import ky from "ky";

export const useCachedPosts = (userId: string) => {
  return useQuery<Post[]>({
    queryKey: ["cachedPosts", userId],
    queryFn: async () => {
      const { posts } = await ky
        .post("/api/post/user/get", {
          json: { user_id: userId },
        })
        .json<{ posts: Post[] }>();
      return posts;
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 3, // 3 minutos
    retry: 1, // uma tentativa de retry
    refetchOnWindowFocus: false, // evita refetch ao trocar de aba
  });
};
