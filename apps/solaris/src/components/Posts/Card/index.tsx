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
import DynamicPopup from "@/components/DynamicPopup";
import { Comment as CommentSchema, PostWithCount } from "@/schemas/post";
import { useMutation } from "@tanstack/react-query";

import { User } from "@/schemas/user";
import { Comment } from "@/components/Comment";
import { getPlaceholder } from "@/libs/blur";
import { useTranslations } from "next-intl";

const DynamicMedia = dynamic(() => import("@/components/DynamicMedia"), {
  ssr: false,
});
const DynamicMediaSkeleton = () => (
  <div className="bg-gray-200 dark:bg-zinc-800 h-60 w-full rounded-lg" />
);
const ContentPreview = dynamic(() => import("@/components/ContentPreview"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full rounded-lg bg-zinc-700" />,
});

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
    const PostT = useTranslations("Post");
    const [comments, setComments] = useState<CommentSchema[]>([
      {
        id: 1,
        author: {
          id: "faedola3",
          name: "Marina Silva",
          picture:
            "https://images.unsplash.com/photo-1494790108755-2616b9c8c0a4?w=100&h=100&fit=crop&crop=face",
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
      isLoading: !!user, // Loading false if user is logged in
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
      mutationFn: async () => {
        const response = await fetch("/api/post/like", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: id,
          }),
        });

        if (!response.ok) {
          throw new Error("Falha ao tentar curtir este post.");
        }

        return await response.json();
      },
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
        const res = await fetch("/api/post/delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            post_id: id,
          }),
        });
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
          key: "privar",
          label: (
            <button
              disabled
              className="w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded"
            >
              Privar (Em breve)
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
                ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 "
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
      <article className="bg-orange-50 dark:bg-zinc-950 rounded-2xl duration-300 overflow-hidden flex flex-col shadow-lg">
        <header className="flex items-center justify-between p-4 bg-orange-50 dark:bg-zinc-900">
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
                loading="lazy"
                placeholder="blur"
                blurDataURL={`data:image/png;base64,${getPlaceholder(author?.picture || "/user.png")}`}
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
                className="w-full h-auto rounded-lg mb-3 "
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
                {PostT("Are you sure?")}
              </h2>
              <div className="flex space-x-3 justify-center">
                <Button
                  onClick={() => setDeletePop(false)}
                  className="bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-zinc-600"
                >
                  {PostT("Cancel")}
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={deleteDisabled}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleteDisabled ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{PostT("Deleting")}</span>
                    </div>
                  ) : (
                    <>
                      <TrashIcon size={16} />
                      <span>{PostT("Delete")}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DynamicPopup>
        </div>
        <footer className="flex items-center justify-between p-4 bg-orange-50 dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800">
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
export default PostCard;
