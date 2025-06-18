"use client";

import React, { useCallback, useState, useMemo, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { UserProfile } from "@/types";
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

const default_banner =
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=400&fit=crop";

const MemoAvatar = React.memo(({ user, onClick }: any) => (
  <div
    className="relative group cursor-pointer"
    onClick={onClick}
  >
    <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
      <AvatarImage src={user?.raw_user_meta_data?.picture} alt={user?.raw_user_meta_data.name} />
      <AvatarFallback className="bg-gradient-to-br from-orange-400 to-yellow-400 text-white text-2xl">
        {user?.raw_user_meta_data.name?.split(" ").map((n: string) => n[0]).join("")}
      </AvatarFallback>
    </Avatar>
    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
      <Camera className="w-6 h-6 text-white" />
    </div>
  </div>
));

const Profile = React.memo(({ user, duplicates, loading, error, setUser, setDuplicates }: any) => {
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'likes'>('posts');
  const { user: currentUser } = useAuth();
  const navigate = useRouter();

  const isCurrentUser = user?.id === currentUser?.id;

  const handleSelectDuplicate = useCallback((selected: UserProfile) => {
    setUser(selected);
    setDuplicates([]);
  }, [setUser, setDuplicates]);

  const formattedDate = useMemo(() =>
    new Date(user?.created_at).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    }), [user?.created_at]);

  if (loading) return <div className="p-8 text-center">Carregando perfil...</div>;
  if (error) return <div className="p-8 text-center text-red-600"><p>Erro: {error}</p><a href="/" className="text-blue-600 underline">Voltar ao início</a></div>;
  if (!user) return <p>Você não está logado</p>;

  if (duplicates.length > 1) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold mb-4">Vários usuários encontrados com esse nome:</h2>
        <ul className="space-y-2">
          {duplicates.map((dup: any) => (
            <li
              key={dup.id}
              className="p-4 bg-orange-50 dark:bg-black shadow rounded cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelectDuplicate(dup)}
            >
              <p className="font-bold">{dup?.raw_user_meta_data?.name ?? "Misterioso(a)"}</p>
              <p className="text-sm text-gray-600">ID: {dup.id}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="dark:bg-black bg-orange-50">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="relative">
          <div
            className="h-48 md:h-64 bg-orange-500 bg-cover bg-center cursor-pointer group"
            style={{ backgroundImage: `url(${user?.banner ?? default_banner})` }}
            onClick={() => setShowBannerModal(true)}
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-200" />
            <div className="absolute top-4 left-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); navigate.back(); }}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0 rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>
            {user?.raw_user_meta_data.banner && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
          <div className="absolute -bottom-16 left-6">
            <MemoAvatar user={user} onClick={() => setShowAvatarModal(true)} />
          </div>
        </div>

        <div className="pt-20 px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1 dark:text-white text-orange-700">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{user?.raw_user_meta_data.name}</h1>
                {user?.raw_user_meta_data.verified && (
                  <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
              <p className="mb-2">@{user?.raw_user_meta_data?.name.toLowerCase() ?? "misterioso(a)"}</p>
              {user?.raw_user_meta_data.badge && (
                <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white mb-3">
                  {user?.raw_user_meta_data.badge}
                </Badge>
              )}
              {user?.raw_user_meta_data.bio && <p className="mb-4 leading-relaxed">{user?.raw_user_meta_data.bio}</p>}
              <div className="flex flex-wrap gap-4 text-sm mb-4">
                {user?.website && (
                  <div className="flex items-center gap-1">
                    <Link2 className="w-4 h-4" />
                    <a href={user?.website} target="_blank" rel="noopener noreferrer" className="hover:text-orange-600 hover:underline">
                      {user?.website.replace('https://', '')}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Entrou em {formattedDate}</span>
                </div>
              </div>
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-orange-900">{user?.following}</span>
                  <span className="text-orange-600/70">Seguindo</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-orange-900">{user?.followers}</span>
                  <span className="text-orange-600/70">Seguidores</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-orange-900">{user?.raw_user_meta_data.posts_count}</span>
                  <span className="text-orange-600/70">Posts</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {isCurrentUser ? (
                <Button onClick={() => navigate.push('/config')} className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white rounded-full px-6">
                  <Edit3 className="w-4 h-4 mr-2" /> Editar Perfil
                </Button>
              ) : (
                <>
                  <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white rounded-full px-6">
                    <Users className="w-4 h-4 mr-2" /> Seguir
                  </Button>
                  <Button variant="outline" size="icon" className="border-orange-300 text-orange-700 hover:bg-orange-50 rounded-full">
                    <Mail className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="border-b border-orange-200 dark:text-white text-orange-600 px-6">
          <div className="flex gap-8">
            {["posts", "media", "likes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
                  activeTab === tab ? 'text-orange-600 border-b-2 border-orange-500' : ' hover:text-orange-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  {tab === 'posts' && <Grid3X3 className="w-4 h-4" />}
                  {tab === 'media' && <Camera className="w-4 h-4" />}
                  {tab === 'likes' && <Heart className="w-4 h-4" />}
                  {tab === 'posts' && 'Posts'}
                  {tab === 'media' && 'Mídia'}
                  {tab === 'likes' && 'Curtidas'}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 dark:text-white text-orange-700">
          {activeTab === 'posts' && <h2>Em breve mostraremos os posts dos usuários.</h2>}
          {activeTab === 'media' && <h2>Em breve mostraremos as mídias dos usuários.</h2>}
          {activeTab === 'likes' && (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 mx-auto mb-4" />
              <p className="">Posts curtidos aparecem aqui</p>
            </div>
          )}
        </div>
      </div>

      {showBannerModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowBannerModal(false)}>
          <div className="max-w-4xl w-full">
            <img
              src={user?.banner ?? default_banner}
              alt="Banner"
              className="w-full rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowAvatarModal(false)}>
          <div className="max-w-md w-full">
            <img
              src={user?.raw_user_meta_data.picture}
              alt="Avatar"
              className="w-full rounded-full"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
});

const ProfileData = () => {
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
