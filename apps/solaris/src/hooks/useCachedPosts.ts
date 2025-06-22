import { Post } from "@/schemas/post";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/libs/orpc"; // Certifique-se de que o orpc está configurado corretamente

export const useCachedPosts = (userId: string) => {
  return useQuery<Post[]>({
    queryKey: ["cachedPosts", userId],
    queryFn: async () => {
      const posts = await orpc.post.getUser.call({ user_id: userId });
      return posts;
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 3, // 3 minutos
    retry: 1, // uma tentativa de retry
    refetchOnWindowFocus: false, // evita refetch ao trocar de aba
  });
};
