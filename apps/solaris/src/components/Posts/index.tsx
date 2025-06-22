"use client";

import React, {
  useState,
  useCallback,
  memo,
  useMemo,
  Suspense,
  useEffect,
  useRef,
} from "react";
import dynamic from "next/dynamic";
import {
  DEFAULT_AVATAR,
  formatNumber,
  formatRelativeTime,
  getUserSlug,
} from "@/libs/utils";

import { MessageCircle, MoreVertical, TrashIcon, Heart } from "lucide-react";
import { Dropdown, Skeleton } from "antd";
import { Button } from "@/components/Button";
import { useAuth } from "@/contexts/auth/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Input } from "../ui/Input";
import type { MenuProps } from "antd";
import DynamicPopup from "../DynamicPopup";
import { orpc } from "@/libs/orpc";
import { PostWithCount } from "@/schemas/post";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "@/types";

// Lazy loading components
const DynamicMedia = dynamic(() => import("../DynamicMedia"), { ssr: false });
const DynamicMediaSkeleton = () => (
  <div className="animate-pulse bg-gray-200 dark:bg-zinc-800 h-60 w-full rounded-lg" />
);
const ContentPreview = dynamic(() => import("../ContentPreview"), {
  ssr: false,
  loading: () => (
    <Skeleton className="h-64 w-full rounded-lg bg-zinc-700 animate-pulse" />
  ),
});

type PostGridProps = {
  data: PostWithCount[];
  loading: boolean;
  error: string | null;
};

interface LikeState {
  count: number;
  liked: boolean;
  isOptimistic: boolean;
  isLoading: boolean;
}

const PostCard: React.FC<PostWithCount & { user: User | null }> = memo(
  ({
    id,
    title,
    content,
    created_at,
    user,
    image,
    author,
    initialLikeCount = 0,
  }) => {
    const router = useRouter();
    const [deletePop, setDeletePop] = useState(false);
    const [comments, setComments] = useState<string[]>([]);
    const [newComment, setNewComment] = useState("");
    const [showComments, setShowComments] = useState(false);
    const [deleteDisabled, setDisabledDelete] = useState(false);
    const likeAnimationRef = useRef<HTMLDivElement>(null);

    // Estado consolidado para likes
    const [likeState, setLikeState] = useState<LikeState>({
      count: initialLikeCount,
      liked: false,
      isOptimistic: false,
      isLoading: false,
    });

    const queryClient = useQueryClient();

    // Query para buscar dados de like do usuário e contagem
    const { data: likeData } = useQuery({
      queryKey: ["post-like-data", id, user?.id],
      queryFn: async () => {
        if (!user?.id) return { count: initialLikeCount, liked: false };

        const [countResult, likeResult] = await Promise.all([
          orpc.post.likeCount.call({ id }),
          orpc.post.checkUserLike.call({ postId: id, userId: user.id }),
        ]);

        return {
          count: countResult.count,
          liked: likeResult.liked,
        };
      },
      enabled: !!user,
      staleTime: 1000 * 60 * 2, // 2 minutos
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    });

    // Atualizar estado local quando dados reais chegam
    useEffect(() => {
      if (!likeState.isOptimistic && likeData) {
        setLikeState((prev) => {
          const safeCount =
            likeData.count === 0 && prev.count > 0
              ? prev.count
              : likeData.count;

          return {
            ...prev,
            count: safeCount,
            liked: likeData.liked,
            isLoading: false,
          };
        });
      }
    }, [likeData, likeState.isOptimistic]);

    // Mutation otimizada para toggle de like
    const toggleLikeMutation = useMutation({
      mutationFn: async () => {
        const result = await orpc.post.like.call({ id });
        return result;
      },
      onMutate: async () => {
        if (!user) {
          toast.error("Faça login para curtir posts");
          throw new Error("Not authenticated");
        }

        // Cancelar queries em andamento
        await queryClient.cancelQueries({
          queryKey: ["post-like-data", id, user.id],
        });

        // Snapshot do estado anterior
        const previousState = { ...likeState };

        // Update otimista
        const newCount = likeState.liked
          ? Math.max(0, likeState.count - 1)
          : likeState.count + 1;

        setLikeState((prev) => ({
          ...prev,
          count: newCount,
          liked: !prev.liked,
          isOptimistic: true,
          isLoading: true,
        }));

        // Animação de like
        if (likeAnimationRef.current && !likeState.liked) {
          likeAnimationRef.current.style.transform = "scale(1.2)";
          setTimeout(() => {
            if (likeAnimationRef.current) {
              likeAnimationRef.current.style.transform = "scale(1)";
            }
          }, 200);
        }

        return { previousState };
      },
      onError: (error, variables, context) => {
        // Reverter para estado anterior
        if (context?.previousState) {
          setLikeState(context.previousState);
        }

        console.error("Erro ao curtir post:", error);
        toast.error("Não foi possível curtir o post. Tente novamente.");
      },
      onSuccess: (data) => {
        setLikeState((prev) => ({
          ...prev,
          count: data?.count ?? prev.count,
          liked: data?.liked ?? prev.liked,
          isOptimistic: false,
          isLoading: false,
        }));
      },
      onSettled: () => {
        setLikeState((prev) => ({ ...prev, isLoading: false }));

        queryClient.refetchQueries({
          queryKey: ["post-like-data", id, user?.id],
          exact: true,
        });
      },
    });
    const fallbackLikeCount = likeData?.count ?? initialLikeCount;
    const handleToggleLike = useCallback(async () => {
      if (toggleLikeMutation.isPending || likeState.isLoading) return;

      try {
        await toggleLikeMutation.mutateAsync();
      } catch (error) {
        // Erro já tratado no onError
      }
    }, [toggleLikeMutation, likeState.isLoading]);

    const handleAddComment = useCallback(() => {
      if (!newComment.trim()) return;
      if (!user) {
        toast.error("Faça login para comentar");
        return;
      }

      setComments((prev) => [...prev, newComment.trim()]);
      setNewComment("");
      toast.success("Comentário adicionado!");
    }, [newComment, user]);

    const handleDelete = useCallback(async () => {
      if (!user || author?.id !== user.id) {
        toast.error("Você não tem permissão para deletar este post");
        return;
      }

      setDisabledDelete(true);

      try {
        const res = await orpc.post.deletePost.call({ post_id: id });
        if (!res) {
          throw new Error("Falha ao deletar");
        }

        setDeletePop(false);
        toast.success("Post deletado com sucesso!");

        // Invalidar cache para atualizar a lista
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      } catch (error) {
        console.error("Erro ao deletar post:", error);
        toast.error("Falha ao deletar o post. Tente novamente.");
      } finally {
        setDisabledDelete(false);
      }
    }, [id, user, author, queryClient]);

    const handleAvatarClick = useCallback(() => {
      if (!author) {
        toast.error("Usuário não encontrado");
        return;
      }
      router.push(getUserSlug(author.name));
    }, [author, router]);

    const menuItems: MenuProps["items"] = useMemo(
      () => [
        {
          key: "edit",
          label: (
            <button className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-zinc-700 rounded">
              Editar (em breve)
            </button>
          ),
          disabled: true,
        },
        {
          key: "delete",
          label: (
            <button
              className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              onClick={() => setDeletePop(true)}
            >
              Deletar
            </button>
          ),
        },
      ],
      [],
    );

    // Componente LikeButton otimizado
    const LikeButton = useMemo(
      () => (
        <button
          onClick={handleToggleLike}
          disabled={likeState.isLoading || toggleLikeMutation.isPending}
          className={`
            flex items-center space-x-2 p-2 rounded-lg transition-all duration-200
            focus:ring-2 focus:ring-orange-500 focus:outline-none
            ${
              likeState.liked
                ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 shadow-sm"
                : "hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-400"
            }
            ${likeState.isLoading ? "opacity-70 cursor-not-allowed" : ""}
          `}
          aria-label={likeState.liked ? "Descurtir post" : "Curtir post"}
        >
          <div
            ref={likeAnimationRef}
            className="relative transition-transform duration-200"
          >
            {likeState.liked ? (
              <Heart
                size={18}
                className="fill-current text-red-500 animate-pulse"
              />
            ) : (
              <Heart
                size={18}
                className={likeState.isLoading ? "animate-pulse" : ""}
              />
            )}

            {/* Indicador de estado otimista */}
            {likeState.isOptimistic && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full animate-ping" />
            )}
          </div>

          <span
            className={`
            font-medium text-sm transition-colors
            ${likeState.isOptimistic ? "text-orange-500" : ""}
            ${likeState.isLoading ? "animate-pulse" : ""}
          `}
          >
            {formatNumber(fallbackLikeCount)}
          </span>

          {/* Loading spinner */}
          {likeState.isLoading && (
            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin opacity-60" />
          )}
        </button>
      ),
      [handleToggleLike, likeState, toggleLikeMutation.isPending],
    );

    return (
      <article className="bg-white dark:bg-zinc-950 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
        <header className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-900">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleAvatarClick}
              className="w-10 h-10 rounded-full ring-2 ring-orange-500 hover:ring-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            >
              <Image
                src={author?.picture || DEFAULT_AVATAR}
                alt={author?.name || "Avatar"}
                width={40}
                height={40}
                className="rounded-full object-cover"
                placeholder="blur"
                blurDataURL={DEFAULT_AVATAR}
              />
            </button>
            <div className="overflow-hidden">
              <p className="font-semibold truncate text-gray-900 dark:text-gray-100">
                {author?.name || "Anônimo"}
              </p>
              <time
                dateTime={new Date(created_at).toISOString()}
                className="text-xs text-gray-500 dark:text-gray-400"
                title={new Date(created_at).toLocaleString()}
              >
                {formatRelativeTime(created_at)}
              </time>
            </div>
          </div>

          {author?.id === user?.id && (
            <Dropdown
              menu={{ items: menuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors">
                <MoreVertical size={20} />
              </button>
            </Dropdown>
          )}
        </header>

        <div className="flex-grow p-4">
          <h3
            className="text-lg font-bold mb-2 truncate text-gray-900 dark:text-gray-100"
            title={title}
          >
            {title}
          </h3>

          {image && (
            <Suspense fallback={<DynamicMediaSkeleton />}>
              <DynamicMedia
                url={image}
                alt={title}
                width={600}
                height={400}
                className="w-full h-auto rounded-lg mb-3 shadow-sm"
              />
            </Suspense>
          )}

          <ContentPreview text={content} />

          <DynamicPopup
            isOpen={deletePop}
            onClose={() => setDeletePop(false)}
            size="sm"
          >
            <div className="text-center p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Tem certeza?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex space-x-3 justify-center">
                <Button
                  onClick={() => setDeletePop(false)}
                  className="bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-zinc-600"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={deleteDisabled}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleteDisabled ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Deletando...</span>
                    </div>
                  ) : (
                    <>
                      <TrashIcon size={16} />
                      <span>Deletar</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DynamicPopup>
        </div>

        <footer className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800">
          <div className="flex space-x-4">
            {LikeButton}
            <button
              onClick={() => setShowComments((v) => !v)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <MessageCircle size={18} />
              <span className="text-sm font-medium">
                {showComments ? "Ocultar" : "Comentar"}
              </span>
            </button>
          </div>
        </footer>

        {showComments && (
          <div className="p-4 bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddComment();
              }}
              className="flex items-center space-x-3 mb-4"
            >
              <Image
                src={user?.picture || DEFAULT_AVATAR}
                alt="Seu avatar"
                width={32}
                height={32}
                className="rounded-full flex-shrink-0"
                loading="lazy"
                priority={false}
                placeholder="blur"
                blurDataURL={DEFAULT_AVATAR}
              />
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="🎨 Deixe sua criatividade fluir..."
                className="flex-1"
                maxLength={500}
                required
              />
              <button
                type="submit"
                disabled={!newComment.trim() || !user}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-950 disabled:cursor-not-allowed text-white rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                Enviar
              </button>
            </form>

            {comments.length > 0 && (
              <div className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-800 space-y-3">
                {comments.map((comment, index) => (
                  <div
                    key={`${id}-comment-${index}`}
                    className="flex items-start space-x-3"
                  >
                    <Image
                      src={user?.picture || DEFAULT_AVATAR}
                      alt="Avatar do comentário"
                      width={24}
                      height={24}
                      className="rounded-full flex-shrink-0"
                      placeholder="blur"
                      blurDataURL={DEFAULT_AVATAR}
                    />
                    <div className="bg-gray-100 dark:bg-zinc-800 rounded-lg px-3 py-2 flex-1">
                      <p className="text-sm break-words text-gray-900 dark:text-gray-100">
                        {comment}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </article>
    );
  },
  (prev, next) =>
    prev.id === next.id &&
    prev.initialLikeCount === next.initialLikeCount &&
    prev.user?.id === next.user?.id &&
    prev.author?.id === next.author?.id,
);

PostCard.displayName = "PostCard";

const PostGrid: React.FC<PostGridProps> = ({ data, loading, error }) => {
  const memoizedData = useMemo(() => data, [data]);
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="animate-pulse bg-gray-200 dark:bg-zinc-800 h-60 rounded-2xl"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!memoizedData.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
          Nenhum post encontrado.
        </p>
        <p className="text-gray-500 dark:text-gray-500">
          Seja o primeiro a compartilhar algo!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
      {memoizedData.map((post) => (
        <PostCard key={post.id} {...post} user={user} />
      ))}
    </div>
  );
};

export default PostGrid;
