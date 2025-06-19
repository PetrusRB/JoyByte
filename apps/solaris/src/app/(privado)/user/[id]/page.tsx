"use client";

import React, { useCallback, useState, useMemo, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth/AuthContext";
import { Button } from "@/components/Button";
import {
  ArrowLeft,
  Badge,
  Calendar,
  Camera,
  Edit3,
  Grid3X3,
  Heart,
  Link2,
  Mail,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Skeleton } from "antd";
import { UserProfile } from "@/types";

const default_banner =
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=400&fit=crop";

interface MemoAvatarProps {
  user: UserProfile | null;
  onClick: () => void;
}

const MemoAvatar = React.memo<MemoAvatarProps>(({ user, onClick }) => (
  <div
    className="relative group cursor-pointer"
    onClick={onClick}
  >
    <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white shadow-lg">
      <AvatarImage src={user?.raw_user_meta_data?.picture} alt={user?.raw_user_meta_data.name} />
      <AvatarFallback className="bg-gradient-to-br from-orange-400 to-yellow-400 text-white text-xl sm:text-2xl">
        {user?.raw_user_meta_data.name?.split(" ").map((n: string) => n[0]).join("")}
      </AvatarFallback>
    </Avatar>
    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
      <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
    </div>
  </div>
));

interface ProfileProps {
  user: UserProfile | null;
  duplicates: UserProfile[];
  loading: boolean;
  error: string | null;
  setUser: (user: UserProfile) => void;
  setDuplicates: (duplicates: UserProfile[]) => void;
}

const Profile = React.memo<ProfileProps>(({ user, duplicates, loading, error, setUser, setDuplicates }) => {
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "media" | "likes">("posts");
  const { user: currentUser } = useAuth();
  const navigate = useRouter();

  const isCurrentUser = user?.id === currentUser?.id;

  const handleSelectDuplicate = useCallback(
    (selected: UserProfile) => {
      setUser(selected);
      setDuplicates([]);
    },
    [setUser, setDuplicates]
  );

  const formattedDate = useMemo(
    () =>
      new Date(user?.created_at || '').toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      }),
    [user?.created_at]
  );

  if (loading)
    return <Skeleton className="h-64 w-full rounded-lg bg-zinc-700 animate-pulse" />;
  if (error)
    return (
      <div className="p-8 text-center text-red-600">
        <p>Erro: {error}</p>
        <Button variant="link" onClick={() => navigate.push("/")}>Voltar ao início</Button>
      </div>
    );
  if (!user) return <p className="p-8 text-center">Você não está logado</p>;

  if (duplicates.length > 1) {
    return (
      <div className="p-4 sm:p-6 flex flex-col gap-4 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-zinc-200">
          Vários usuários encontrados:
        </h2>
        <ul className="space-y-2">
          {duplicates.map((dup: UserProfile) => (
            <li
              key={dup.id}
              className="p-4 bg-zinc-800 text-white rounded cursor-pointer hover:bg-zinc-700 transition-colors"
              onClick={() => handleSelectDuplicate(dup)}
            >
              <p className="font-bold">{dup.raw_user_meta_data?.name}</p>
              <p className="text-sm text-zinc-400">ID: {dup.id}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="dark:bg-black bg-orange-50 min-h-screen pb-8 dark:text-white text-orange-700">
      {/* Banner Section */}
      <div className="relative">
        <div
          className="h-48 sm:h-56 md:h-64 bg-zinc-800 dark:text-white text-orange-50 bg-center bg-cover cursor-pointer w-full"
          style={{ backgroundImage: `url(${user.banner ?? default_banner})` }}
          onClick={() => setShowBannerModal(true)}
        >
          <div className="absolute inset-0 bg-black/20 transition-all" />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 bg-zinc-700/50 hover:bg-zinc-600 rounded-full"
            onClick={() => navigate.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
        {/* Avatar positioned absolutely */}
        <div className="absolute -bottom-12 sm:-bottom-16 left-1/2 transform -translate-x-1/2">
          <MemoAvatar user={user} onClick={() => setShowAvatarModal(true)} />
        </div>
      </div>

      {/* Profile Content */}
      <div className="mt-16 sm:mt-20 w-full max-w-4xl mx-auto px-4 sm:px-6">
        {/* Profile Info and Actions */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Profile Info */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
              <h1 className="text-xl sm:text-2xl font-bold">
                {user.raw_user_meta_data.name}
              </h1>
              {user.raw_user_meta_data.verified && (
                <Badge className="bg-zinc-700" />
              )}
            </div>
            <p className="mb-4 dark:text-white text-orange-500">
              @{user.raw_user_meta_data.name.toLowerCase()}
            </p>

            {user.raw_user_meta_data.bio && (
              <p className="mb-4 leading-relaxed max-w-lg mx-auto lg:mx-0">
                {user.raw_user_meta_data.bio}
              </p>
            )}

            {/* Profile Details */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-sm mb-4 justify-center lg:justify-start">
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-zinc-100 transition-colors justify-center lg:justify-start"
                >
                  <Link2 className="w-4 h-4" />
                  <span className="truncate">{user.website.replace("https://", "")}</span>
                </a>
              )}
              <div className="flex items-center gap-1 justify-center lg:justify-start">
                <Calendar className="w-4 h-4" />
                <span>Entrou em {formattedDate}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4 sm:gap-8 justify-center lg:justify-start">
              <div className="flex flex-col items-center">
                <span className="font-semibold">{user.following || 0}</span>
                <span className="text-xs sm:text-sm">Seguindo</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-semibold">{user.followers || 0}</span>
                <span className="text-xs sm:text-sm">Seguidores</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-semibold">{user.raw_user_meta_data.posts_count || 0}</span>
                <span className="text-xs sm:text-sm">Posts</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-center lg:justify-end flex-shrink-0">
            {isCurrentUser ? (
              <Button
                onClick={() => navigate.push("/config")}
                className="bg-zinc-700 text-white rounded-full px-4 py-2 hover:bg-zinc-600 transition-colors"
              >
                <Edit3 className="w-4 h-4 mr-2" /> Editar Perfil
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button className="bg-zinc-700 text-white rounded-full px-4 py-2 hover:bg-zinc-600 transition-colors">
                  <Users className="w-4 h-4 mr-2" /> Seguir
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-zinc-600 hover:bg-zinc-800 rounded-full"
                >
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="border-b border-zinc-700 mt-8">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex gap-2 sm:gap-6 justify-center overflow-x-auto">
            {(['posts', 'media', 'likes'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-3 sm:px-4 text-sm sm:text-base hover:text-orange-800 transition-colors whitespace-nowrap ${
                  activeTab === tab ? 'text-orange-700 border-b-2 border-zinc-500' : ''
                }`}
              >
                {tab === 'posts' && <Grid3X3 className="w-4 h-4 inline-block mr-1" />}
                {tab === 'media' && <Camera className="w-4 h-4 inline-block mr-1" />}
                {tab === 'likes' && <Heart className="w-4 h-4 inline-block mr-1" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'posts' && (
          <div className="text-center py-8">
            <Grid3X3 className="w-12 h-12 mx-auto mb-4" />
            <p>Posts do usuário aparecerão aqui...</p>
          </div>
        )}
        {activeTab === 'media' && (
          <div className="text-center py-8">
            <Camera className="w-12 h-12 mx-auto mb-4" />
            <p>Mídias do usuário aparecerão aqui...</p>
          </div>
        )}
        {activeTab === 'likes' && (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 mx-auto mb-4" />
            <p>Posts curtidos aparecerão aqui.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showBannerModal && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowBannerModal(false)}
        >
          <Suspense fallback={<Skeleton className="h-80 w-full max-w-4xl rounded-lg animate-pulse" />}>
            <img
              src={user.banner ?? default_banner}
              alt="Banner"
              className="w-full max-w-4xl h-auto rounded-lg object-cover"
              loading="lazy"
              onClick={(e) => e.stopPropagation()}
            />
          </Suspense>
        </div>
      )}

      {showAvatarModal && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowAvatarModal(false)}
        >
          <Suspense fallback={<Skeleton className="h-48 w-48 rounded-full animate-pulse" />}>
            <img
              src={user.raw_user_meta_data.picture}
              alt="Avatar"
              className="h-48 w-48 sm:h-64 sm:w-64 rounded-full object-cover"
              loading="lazy"
              onClick={(e) => e.stopPropagation()}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
});

const ProfileData: React.FC = () => {
  const { id: username } = useParams<{ id: string }>();
  if (!username) return null;

  const { user, duplicates, loading, error, setUser, setDuplicates } = useUserProfile(username);

  return (
    <Suspense fallback={<div className="p-6 text-center">Carregando perfil...</div>}>
      <Profile user={user} duplicates={duplicates} loading={loading} error={error} setUser={setUser} setDuplicates={setDuplicates} />
    </Suspense>
  );
};

export default ProfileData;
