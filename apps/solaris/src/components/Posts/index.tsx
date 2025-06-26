"use client";

import React, {
  useState,
  useCallback,
  memo,
  useMemo,
  Suspense,
  useEffect,
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
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import type { MenuProps } from "antd";
import DynamicPopup from "../DynamicPopup";
import { orpc } from "@/libs/orpc";
import { Comment as CommentSchema, PostWithCount } from "@/schemas/post";
import { useMutation } from "@tanstack/react-query";

import supabase from "@/db";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { debounce } from "lodash"; // Ensure lodash is installed: `npm install lodash`
import { User } from "@/schemas/user";
import { Comment } from "../Comment";

interface PostLike {
  post_id: number;
  user_id: string;
}

const isPostLike = (obj: {} | PostLike): obj is PostLike => {
  return "post_id" in obj && typeof obj.post_id === "number";
};

const DynamicMedia = dynamic(() => import("../DynamicMedia"), { ssr: false });
const DynamicMediaSkeleton = () => (
  <div className="bg-gray-200 dark:bg-zinc-800 h-60 w-full rounded-lg" />
);
const ContentPreview = dynamic(() => import("../ContentPreview"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full rounded-lg bg-zinc-700" />,
});

type PostGridProps = {
  data: PostWithCount[];
  loading: boolean;
  error: string | null;
  user: User | null;
};

interface LikeState {
  count: number;
  liked: boolean;
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
    const [comments, setComments] = useState<CommentSchema[]>([
      {
        id: 1,
        author: {
          name: "Marina Silva",
          avatar:
            "https://images.unsplash.com/photo-1494790108755-2616b9c8c0a4?w=100&h=100&fit=crop&crop=face",
          isVerified: true,
        },
        content:
          "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        timestamp: new Date(Date.now()).toISOString(),
        likes: 12,
        replies: [
          {
            id: "1-1",
            author: "João Santos",
            avatar:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
            content:
              "Concordo totalmente! A experiência no mobile é excepcional.",
            timestamp: new Date("2024-06-24T11:15:00"),
            likes: 3,
            isLiked: true,
          },
        ],
        isLiked: false,
      },
    ]);
    const [newComment, setNewComment] = useState("");
    const [showComments, setShowComments] = useState(false);
    const [deleteDisabled, setDisabledDelete] = useState(false);

    // Initialize like state
    const [likeState, setLikeState] = useState<LikeState>({
      count: initialLikeCount,
      liked: false,
      isLoading: !!user, // Loading true if user is logged in
    });

    // Listen for like updates via custom events
    useEffect(() => {
      const handleLikeUpdate = (event: CustomEvent) => {
        if (event.detail.postId === id) {
          setLikeState({
            count: event.detail.count,
            liked: user ? event.detail.liked : false,
            isLoading: false,
          });
        }
      };

      window.addEventListener("likeUpdate", handleLikeUpdate as EventListener);
      return () => {
        window.removeEventListener(
          "likeUpdate",
          handleLikeUpdate as EventListener,
        );
      };
    }, [id, user]);

    const toggleLikeMutation = useMutation<
      { liked: boolean; count: number },
      unknown,
      void,
      { previousState: LikeState }
    >({
      mutationFn: () => orpc.post.like.call({ id }),
      onMutate: async () => {
        if (!user) {
          toast.error("Faça login para curtir posts");
          throw new Error("Not authenticated");
        }

        const previousState = likeState;
        setLikeState((prev) => ({
          ...prev,
          count: prev.liked ? Math.max(0, prev.count - 1) : prev.count + 1,
          liked: !prev.liked,
          isLoading: true,
        }));
        return { previousState };
      },
      onError: (error, variables, context) => {
        setLikeState(context?.previousState || likeState);
        toast.error("Não foi possível curtir o post. Tente novamente.");
      },
      onSuccess: (data) => {
        setLikeState((prev) => ({
          ...prev,
          count: data.count,
          liked: data.liked,
          isLoading: false,
        }));
      },
    });

    const handleToggleLike = useCallback(() => {
      if (toggleLikeMutation.isPending || likeState.isLoading) return;
      toggleLikeMutation.mutate();
    }, [toggleLikeMutation, likeState.isLoading]);

    const handleAddComment = useCallback(() => {
      if (!newComment.trim()) return;
      if (!user) {
        toast.error("Faça login para comentar");
        return;
      }

      const comment = {
        id: comments.length + 1,
        author: {
          ...user,
          normalized_name: user.normalized_name || undefined,
        },
        content: newComment,
        timestamp: new Date(Date.now()).toISOString(),
        likes: 0,
        replies: [],
        isLiked: false,
      };

      setComments([comment, ...comments]);
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
        toast.success(
          "Post deletado com sucesso, recarregue a pagina para ver as alterações",
        );
      } catch (error) {
        console.error("Erro ao deletar post:", error);
        toast.error("Falha ao deletar o post. Tente novamente.");
      } finally {
        setDisabledDelete(false);
      }
    }, [id, user, author]);

    const handleAvatarClick = useCallback(() => {
      if (!author) {
        toast.error("Usuário não encontrado");
        return;
      }
      router.push(getUserSlug(author?.normalized_name ?? ""));
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

    const LikeButton = useMemo(
      () => (
        <button
          onClick={handleToggleLike}
          disabled={likeState.isLoading || toggleLikeMutation.isPending}
          className={`
            flex items-center space-x-2 p-2 rounded-lg
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
          <Heart
            size={18}
            className={likeState.liked ? "fill-current text-red-500" : ""}
          />
          <span className="font-medium text-sm">
            {formatNumber(likeState.count)}
          </span>
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
          <Comment.Section
            comments={comments}
            setComments={setComments}
            user={user}
            contentComment={newComment}
            setContentComment={setNewComment}
            handleAddComment={handleAddComment}
          />
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

const PostGrid: React.FC<PostGridProps> = ({ data, loading, error, user }) => {
  const memoizedData = useMemo(() => data, [data]);

  useEffect(() => {
    if (!user || !data.length) return;

    const postIds = data.map((post) => post.id);
    const pendingUpdates = new Set<number>();

    // Initial batch fetch
    orpc.post.batchGetPostLikeData
      .call({ ids: postIds })
      .then((results) => {
        results.forEach(({ postId, liked, count }) => {
          const event = new CustomEvent("likeUpdate", {
            detail: { postId, liked, count },
          });
          window.dispatchEvent(event);
        });
      })
      .catch((error) => {
        console.error("Erro ao buscar dados de like em lote:", error);
      });

    // Debounced batch update for real-time changes
    const debouncedUpdate = debounce(() => {
      if (pendingUpdates.size === 0) return;
      const ids = Array.from(pendingUpdates);
      pendingUpdates.clear();
      orpc.post.batchGetPostLikeData
        .call({ ids })
        .then((results) => {
          results.forEach(({ postId, liked, count }) => {
            const event = new CustomEvent("likeUpdate", {
              detail: { postId, liked, count },
            });
            window.dispatchEvent(event);
          });
        })
        .catch((error) => {
          console.error("Erro ao atualizar curtidas em lote:", error);
        });
    }, 300);

    // Real-time subscription
    const channel = supabase
      .channel("post_likes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "post_likes",
          filter: `post_id=in.(${postIds.join(",")})`,
        },
        (payload: RealtimePostgresChangesPayload<PostLike>) => {
          const postId = isPostLike(payload.new)
            ? payload.new.post_id
            : isPostLike(payload.old)
              ? payload.old.post_id
              : null;
          if (!postId || !postIds.includes(postId)) return;
          pendingUpdates.add(postId);
          debouncedUpdate();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [data, user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="bg-gray-200 dark:bg-zinc-800 h-60 rounded-2xl"
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
