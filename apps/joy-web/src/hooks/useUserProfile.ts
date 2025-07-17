"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserProfile } from "@/schemas/user";

interface UserProfileResponse {
  primary: UserProfile | null;
  duplicates: UserProfile[];
  postCount: number;
  followers: FollowerProfile[];
  following: FollowerProfile[];
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

interface FollowerProfile {
  id: string;
  name: string;
  picture: string;
  bio?: string;
  normalized_name?: string;
}

const DEFAULT_RESPONSE: UserProfileResponse = {
  primary: null,
  duplicates: [],
  postCount: 0,
  followers: [],
  following: [],
  followersCount: 0,
  followingCount: 0,
  isFollowing: false,
};

const fetchJson = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};

const fetchUserProfile = async (
  userId: string,
  signal?: AbortSignal,
): Promise<UserProfileResponse> => {
  if (!userId?.trim()) return DEFAULT_RESPONSE;

  // Get user data first
  const userResponse = await fetchJson(
    `/api/search/user?user=${encodeURIComponent(userId)}`,
    { signal },
  );

  const users = userResponse.users || [];
  if (users.length === 0) throw new Error("User not found");

  const primaryUser = users[0];
  const actualUserId = primaryUser.id;

  // Fetch related data in parallel
  const [followersRes, followingRes, followStatusRes, postsRes] =
    await Promise.allSettled([
      fetchJson(
        `/api/user/followers?userId=${encodeURIComponent(actualUserId)}`,
        { signal },
      ),
      fetchJson(
        `/api/user/following?userId=${encodeURIComponent(actualUserId)}`,
        { signal },
      ),
      fetchJson(
        `/api/user/following-status?userId=${encodeURIComponent(actualUserId)}`,
        { signal },
      ),
      fetchJson(`/api/post/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: actualUserId }),
        signal,
      }),
    ]);

  // Process results
  const followers =
    followersRes.status === "fulfilled"
      ? followersRes.value.followers?.map((f: any) => f.profile) || []
      : [];
  const followersCount =
    followersRes.status === "fulfilled"
      ? followersRes.value.total || followersRes.value.count || 0
      : 0;

  const following =
    followingRes.status === "fulfilled"
      ? followingRes.value.following?.map((f: any) => f.profile) || []
      : [];
  const followingCount =
    followingRes.status === "fulfilled"
      ? followingRes.value.total || followingRes.value.count || 0
      : 0;

  const isFollowing =
    followStatusRes.status === "fulfilled"
      ? followStatusRes.value.following || false
      : false;

  const postCount =
    postsRes.status === "fulfilled"
      ? Array.isArray(postsRes.value)
        ? postsRes.value.length
        : 0
      : 0;

  // Process users
  const processedUsers = users.map(
    (user: any): UserProfile => ({
      id: user.id,
      email: user.email || "",
      name: user.name || "Sem Nome",
      picture: user.picture || "/user.png",
      bio: user.bio || "",
      banner: user.banner || "",
      social_media: user.social_media || {},
      created_at: user.created_at,
      preferences: user.preferences || {},
      normalized_name: user.normalized_name || "",
      followers: followersCount,
      following: followingCount,
    }),
  );

  return {
    primary: processedUsers[0],
    duplicates: processedUsers.slice(1),
    postCount,
    followers,
    following,
    followersCount,
    followingCount,
    isFollowing,
  };
};

export function useUserProfile(rawUsername?: string) {
  const userId = rawUsername?.trim();

  const query = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: ({ signal }) => fetchUserProfile(userId!, signal),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 min
    retry: (count, error) =>
      count < 2 &&
      !(error instanceof DOMException) &&
      (error as Error).message !== "User not found",
    refetchOnWindowFocus: false,
  });

  return {
    user: query.data?.primary ?? null,
    duplicates: query.data?.duplicates ?? [],
    postCount: query.data?.postCount ?? 0,
    followers: query.data?.followers ?? [],
    followersCount: query.data?.followersCount ?? 0,
    following: query.data?.following ?? [],
    followingCount: query.data?.followingCount ?? 0,
    isFollowing: query.data?.isFollowing ?? false,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isNotFound:
      query.isError && (query.error as Error)?.message === "User not found",
  };
}

export function useFollowAction() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch("/api/user/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao seguir usuário");
      }

      return response.json();
    },
    onSuccess: (data, userId) => {
      queryClient.setQueryData(
        ["userProfile", userId],
        (old: UserProfileResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            isFollowing: data.following,
            followersCount: data.following
              ? old.followersCount + 1
              : Math.max(0, old.followersCount - 1),
          };
        },
      );
    },
  });

  return {
    followUser: mutation.mutate,
    loading: mutation.isPending,
    error: mutation.error,
  };
}
