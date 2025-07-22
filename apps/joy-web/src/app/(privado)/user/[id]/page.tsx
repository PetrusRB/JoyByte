"use client";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { useParams } from "next/navigation";

import { useUserProfile } from "@/hooks/useUserProfile";

import { Loader } from "@/components/Loader";
import { UserProfile } from "@hexagano/backend";
import { Post } from "@hexagano/backend";
import { Profile as ProfileComp } from "@/components/Profile";
import { useAuth } from "@/contexts/auth/AuthContext";

const ErrorDisplay = dynamic(() => import("@/components/ErrorDisplay"), {
  ssr: false,
});

interface ProfileProps {
  user: UserProfile | null;
  posts: Post[] | undefined;
  duplicates: UserProfile[]; // Add this line
  loading: boolean;
  loadingPosts: boolean;
  failedPosts: boolean;
  error: string | null;
  setUser: (user: UserProfile) => void;
  setDuplicates: (duplicates: UserProfile[]) => void;
}

const Profile = React.memo<ProfileProps>(() => {
  const { id: username } = useParams<{ id: string }>();
  const { user } = useAuth();
  const {
    user: profile,
    loading,
    postCount,
    isFollowing,
    error,
  } = useUserProfile(username);
  const [activeTab, setActiveTab] = useState<"posts" | "media" | "likes">(
    "posts",
  );

  if (loading) return <Loader.Spinner />;
  if (error) return <ErrorDisplay error={error?.message} />;
  if (!profile) return <ErrorDisplay error="user_not_found" />;

  return (
    <div className="dark:bg-black bg-orange-50 min-h-screen pb-8 dark:text-white text-orange-700">
      <ProfileComp.Header
        banner={profile?.banner || ""}
        avatar={profile.picture || "/user.png"}
        name={profile.name || "Misterioso(a)"}
      />

      <div className="mt-16 sm:mt-20 w-full max-w-4xl mx-auto px-4 sm:px-6">
        <ProfileComp.Info
          profile={profile}
          isFollowing={isFollowing}
          postCount={postCount}
          isCurrentUser={profile.id === user?.id}
        />
      </div>

      <ProfileComp.Tabs activeTab={activeTab} onChangeTab={setActiveTab} />

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <ProfileComp.Content tab={activeTab} userId={profile.id} />
      </div>
    </div>
  );
});

export default Profile;
