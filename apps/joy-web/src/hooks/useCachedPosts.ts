import { Post } from "@hexagano/backend";
import { useQuery } from "@tanstack/react-query";

export const useCachedPosts = (userId: string) => {
  return useQuery<Post[]>({
    queryKey: ["cachedPosts", userId],
    queryFn: async () => {
      const res = await fetch("/api/post/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
        }),
      });

      if (!res.ok) {
        throw new Error("Erro ao buscar posts do usuário");
      }

      return res.json();
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 3, // 3 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 1, // uma tentativa de retry
    refetchOnWindowFocus: false, // evita refetch ao trocar de aba
  });
};
