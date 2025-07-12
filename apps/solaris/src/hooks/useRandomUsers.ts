"use client";

import { useQuery } from "@tanstack/react-query";
import { User, UserProfile } from "@/schemas/user";

export function useRandomUsers(user: User | null) {
  const query = useQuery({
    queryKey: ["randomUsers"],

    queryFn: async () => {
      const res = await fetch(`/api/search/random?limit=5&offset=0`, {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error("Failed to search user");
      }

      const json = await res.json();

      const users: UserProfile[] = json.users.map((u: any) => ({
        id: u.id,
        name: u.name ?? "Sem Nome",
        picture: u.picture ?? "/user.png",
        preferences: u.preferences || {},
        normalized_name: u.normalized_name ?? "",
      }));

      return {
        primary: users[0] ?? null,
        duplicates: users.slice(1),
      };
    },
    enabled: Boolean(user),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    user: query.data?.primary ?? null,
    duplicates: query.data?.duplicates ?? [],
    loading: query.isLoading,
    error: query.isError ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
}
