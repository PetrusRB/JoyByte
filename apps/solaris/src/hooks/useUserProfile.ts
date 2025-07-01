"use client";

import { useQuery } from "@tanstack/react-query";
import { UserProfile } from "@/schemas/user";

export function useUserProfile(rawUsername?: string) {
  const username = rawUsername?.trim();

  const query = useQuery({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      if (!username) {
        return {
          primary: null as UserProfile | null,
          duplicates: [] as UserProfile[],
        };
      }

      const res = await fetch(`/api/search/user?user=${username}`, {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error("Failed to search user");
      }

      const json = await res.json();

      const users: UserProfile[] = json.users.map((u: any) => ({
        id: u.id,
        email: u.email ?? "",
        bio: u.bio ?? "",
        banner: u.banner ?? "",
        social_media: u.social_media || {},
        created_at: u.created_at,
        preferences: u.preferences || {},
        raw_user_meta_data: u.raw_user_meta_data ?? {},
        normalized_name: u.normalized_name ?? "",
        posts: u.posts ?? [],
      }));

      return {
        primary: users[0] ?? null,
        duplicates: users.slice(1),
      };
    },
    enabled: Boolean(username),
    staleTime: 1000 * 60 * 5, // 5 minutos
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
