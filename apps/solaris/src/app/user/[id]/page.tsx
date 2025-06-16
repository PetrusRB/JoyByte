"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import supabase from "@/db";
import { UserProfile } from "@/types";
import { useAuth } from "@/contexts/auth/AuthContext";
import { z } from "zod";
import { Button } from "@/components/Button";
import { ArrowLeft, Badge, Calendar, Camera, Edit3, Grid3X3, Heart, Link2, Mail, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { usernameSlugSchema } from "@/schemas/user";

// Utilitário: converte 'pedro.silvia.oliveira' → 'Pedro Silvia Oliveira'
const slugToFullName = (username: string) => {
  return username
    .split(".")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};

const default_banner = "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=400&fit=crop"

const Profile = () => {
  const { id: username } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [duplicates, setDuplicates] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'likes'>('posts');
  const [error, setError] = useState<string | null>(null);

  const navigate = useRouter();

  useEffect(() => {
    const fetchUserByName = async (fullName: string) => {
      const { data, error: supaError } = await supabase
        .from("profiles")
        .select("*")
        .ilike("raw_user_meta_data->>name", `%${fullName}%`);

      if (supaError) throw supaError;

      if (!data || data.length === 0) {
        setError(`Usuário não encontrado: ${fullName}`);
      } else if (data.length === 1) {
        setUser(data[0]);
      } else {
        setDuplicates(data);
      }
    };

    const run = async () => {
      try {
        if (!username) {
          setError("Slug não fornecido");
          return;
        }

        const parsedSlug = usernameSlugSchema.safeParse(username);
        if (!parsedSlug.success) {
          setError("Slug inválido");
          return;
        }

        const fullName = slugToFullName(username);
        await fetchUserByName(fullName);
      } catch (err) {
        console.error("Erro ao buscar perfil:", err);
        setError("Erro ao buscar perfil");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [username]);

  const handleSelectDuplicate = (selectedUser: UserProfile) => {
    setUser(selectedUser);
    setDuplicates([]);
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando perfil...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Erro: {error}</p>
        <a href="/" className="text-blue-600 underline">
          Voltar ao início
        </a>
      </div>
    );
  }

  if (duplicates.length > 1) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold mb-4">
          Vários usuários encontrados com esse nome:
        </h2>
        <ul className="space-y-2">
          {duplicates.map(dup => (
            <li
              key={dup.id}
              className="p-4 bg-orange-50 dark:bg-black shadow rounded cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelectDuplicate(dup)}
            >
              <p className="font-bold">{dup?.raw_user_meta_data?.name??"Misterioso(a)"}</p>
              <p className="text-sm text-gray-600">ID: {dup.id}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (!user) {
    return <div className="p-8 text-center text-red-500">Usuário não encontrado.</div>;
  }

  const isCurrentUser = user.id === currentUser?.id;

  return (
    <div className="dark:bg-black bg-orange-50">
          <div className="max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto space-y-4 sm:space-y-6">
            {/* Banner Section */}
            <div className="relative">
              <div
                className="h-48 md:h-64 bg-orange-500 bg-cover bg-center cursor-pointer group"
                style={{ backgroundImage: `url(${user?.banner??default_banner})`}}
                onClick={() => setShowBannerModal(true)}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-200"></div>
                <div className="absolute top-4 left-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate.back();
                    }}
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

              {/* Profile Picture */}
              <div className="absolute -bottom-16 left-6">
                <div
                  className="relative group cursor-pointer"
                  onClick={() => setShowAvatarModal(true)}
                >
                  <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                    <AvatarImage src={user?.raw_user_meta_data?.picture} alt={user?.raw_user_meta_data.name} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-yellow-400 text-white text-2xl">
                      {user?.raw_user_meta_data.name?.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="pt-20 px-6 pb-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1 dark:text-white text-orange-700">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold">
                      {user?.raw_user_meta_data.name}
                    </h1>
                    {user?.raw_user_meta_data.verified && (
                      <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>

                  <p className="mb-2">@{user?.raw_user_meta_data?.name.toLowerCase()??"misterioso(a)"}</p>

                  {user?.raw_user_meta_data.badge && (
                    <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white mb-3">
                      {user?.raw_user_meta_data.badge}
                    </Badge>
                  )}

                  {user?.raw_user_meta_data.bio && (
                    <p className="mb-4 leading-relaxed">{user?.raw_user_meta_data.bio}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm mb-4">
                    {/* {user?.raw_user_meta_data.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{user?.raw_user_meta_data.location}</span>
                      </div>
                    )} */}
                    {user?.raw_user_meta_data.website && (
                      <div className="flex items-center gap-1">
                        <Link2 className="w-4 h-4" />
                        <a href={user?.raw_user_meta_data.website} target="_blank" rel="noopener noreferrer"
                           className="hover:text-orange-600 hover:underline">
                          {user?.raw_user_meta_data.website.replace('https://', '')}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Entrou em {new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-orange-900">{user?.raw_user_meta_data.following_count}</span>
                      <span className="text-orange-600/70">Seguindo</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-orange-900">{user?.raw_user_meta_data.followers_count}</span>
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
                    <Button
                      onClick={() => navigate.push('/config')}
                      className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white cursor-pointer rounded-full px-6"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Editar Perfil
                    </Button>
                  ) : (
                    <>
                      <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white rounded-full px-6">
                        <Users className="w-4 h-4 mr-2" />
                        Seguir
                      </Button>
                      <Button variant="outline" size="icon" className="border-orange-300 text-orange-700 hover:bg-orange-50 rounded-full">
                        <Mail className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-orange-200 dark:text-white text-orange-600 px-6">
              <div className="flex gap-8">
                {(['posts', 'media', 'likes'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
                      activeTab === tab
                        ? 'text-orange-600 border-b-2 border-orange-500'
                        : ' hover:text-orange-600'
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

            {/* Content */}
            <div className="p-6 dark:text-white text-orange-700">
              {activeTab === 'posts' && (
                <div className="space-y-6">
                  {/* {mockPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))} */}
                  <h2>Em breve mostraremos os posts dos usuários.</h2>
                </div>
              )}

              {activeTab === 'media' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* {mockPosts.filter(post => post.image).map((post) => (
                    <div key={post.id} className="aspect-square rounded-xl overflow-hidden bg-orange-100">
                      <img
                        src={post.image}
                        alt="Media post"
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      />
                    </div>
                  ))} */}
                                    <h2>Em breve mostraremos as midias dos usuários.</h2>
                </div>
              )}

              {activeTab === 'likes' && (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 mx-auto mb-4" />
                  <p className="">Posts curtidos aparecem aqui</p>
                </div>
              )}
            </div>
          </div>

          {/* Modais para visualizar banner e avatar */}
          {showBannerModal && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowBannerModal(false)}>
              <div className="max-w-4xl w-full">
                <img
                  src={user?.raw_user_meta_data.banner}
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
};

export default Profile;
