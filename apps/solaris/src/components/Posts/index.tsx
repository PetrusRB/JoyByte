"use client";

import React, { useState, useCallback, memo, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import {
  DEFAULT_AVATAR,
  formatNumber,
  formatRelativeTime,
  getUserSlug,
} from "@/libs/utils";
import { Post as PostType } from "@/types";
import { ThumbsUp, MessageCircle, MoreVertical, TrashIcon } from "lucide-react";
import { Dropdown, Skeleton } from "antd";
import { useAuth } from "@/contexts/auth/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Input } from "../ui/Input";
import { RequestButton } from "../RequestButton";
import type { MenuProps } from "antd";
import DynamicPopup from "../DynamicPopup";

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
  data: PostType[];
  loading: boolean;
  error: string | null;
};

const PostCard: React.FC<PostType> = memo(
  ({ id, title, content, created_at, likes, image, author }) => {
    const { user } = useAuth();
    const router = useRouter();
    const [deletePop, setDeletePop] = useState<boolean>(false);
    const [comments, setComments] = useState<string[]>([]);
    const [newComment, setNewComment] = useState("");
    const [showComments, setShowComments] = useState(false);

    const handleAddComment = useCallback(() => {
      if (!newComment.trim()) return;
      setComments((prev) => [...prev, newComment]);
      setNewComment("");
    }, [newComment]);

    const handleAvatarClick = useCallback(() => {
      if (!author) {
        toast("Usuário não encontrado");
        return;
      }
      author.name && router.push(getUserSlug(author.name));
    }, [author, router]);

    const menuItems: MenuProps["items"] = useMemo(
      () => [
        {
          key: "edit",
          label: (
            <button
              className="w-full text-left px-4 py-2"
              onClick={() => toast("Privado em construção")}
            >
              Privado
            </button>
          ),
        },
        {
          key: "delete",
          label: (
            <button
              className="w-full text-left px-4 py-2 text-red-600"
              onClick={() => setDeletePop(true)}
            >
              Deletar
            </button>
          ),
        },
      ],
      [],
    );

    return (
      <article className="bg-white dark:bg-zinc-950 text-gray-900 dark:text-white rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden flex flex-col">
        <header className="flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <button
              onClick={handleAvatarClick}
              aria-label="Ver perfil"
              className="flex-shrink-0 w-10 h-10 rounded-full ring-1 ring-orange-500 hover:ring-orange-400 focus:outline-none focus:ring-4"
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
              <p className="font-semibold truncate max-w-xs">
                {author?.name || "Anônimo"}
              </p>
              <time
                dateTime={new Date(created_at).toISOString()}
                className="text-xs text-gray-500 dark:text-gray-400"
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
              className="dark:bg-zinc-950 border-b border-zinc-900"
            >
              <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 focus:outline-none">
                <MoreVertical size={20} />
              </button>
            </Dropdown>
          )}
        </header>

        <div className="flex-grow px-5 py-4">
          <h3 className="text-lg font-bold mb-2 truncate" title={title}>
            {title}
          </h3>
          {image && (
            <Suspense fallback={<DynamicMediaSkeleton />}>
              <DynamicMedia
                url={image}
                alt={title}
                width={600}
                height={400}
                className="w-full h-auto object-cover rounded-lg mb-3"
              />
            </Suspense>
          )}

          <ContentPreview text={content} />

          <DynamicPopup
            isOpen={deletePop}
            onClose={() => setDeletePop(false)}
            size="sm"
          >
            <div className="text-center space-y-6 p-6">
              <div className="flex justify-center items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-center gap-1">
                  Quer mesmo <span className="text-red-500">Deletar?</span>
                </h2>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                <RequestButton
                  url="/api/post/delete"
                  method="POST"
                  body={{ id: id }}
                  onSuccess={() => setDeletePop(false)}
                  message="Deletado com sucesso, recarregue a página para visualizar as alterações."
                  label="Deletar"
                  className="flex flex-row-reverse text-left px-4 py-2 dark:text-red-600 text-red-600"
                >
                  <TrashIcon color="white" />
                </RequestButton>
              </div>
            </div>
          </DynamicPopup>
        </div>

        <footer className="px-5 py-3 bg-gray-50 dark:bg-zinc-900 flex items-center justify-between">
          <div className="flex space-x-4">
            <button
              className="flex items-center space-x-1 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800 focus:outline-none transition"
              aria-label="Curtir"
            >
              <ThumbsUp size={18} />{" "}
              <span className="text-sm">{formatNumber(likes)}</span>
            </button>
            <button
              onClick={() => setShowComments((v) => !v)}
              className="flex items-center space-x-1 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800 focus:outline-none transition"
              aria-label="Comentar"
            >
              <MessageCircle size={18} />{" "}
              <span className="text-sm">Comentar</span>
            </button>
          </div>
        </footer>

        {showComments && (
          <div className="px-5 py-3 bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-gray-700">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddComment();
              }}
              className="flex items-center gap-3 mb-3"
            >
              <Image
                src={user?.picture || DEFAULT_AVATAR}
                alt="Seu avatar"
                width={32}
                height={32}
                className="rounded-full"
                loading="lazy"
                priority={false}
                placeholder="blur"
                blurDataURL={DEFAULT_AVATAR}
              />
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="🎨 Deixe sua criatividade fluir..."
                required
              />
              <button
                type="submit"
                className="px-4 py-1 bg-orange-500 rounded-full hover:bg-orange-600 text-white focus:outline-none transition"
              >
                Enviar
              </button>
            </form>
            <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-800">
              {comments.map((c, i) => (
                <div key={`${id}-c-${i}`} className="flex items-start gap-2">
                  <Image
                    src={user?.picture || DEFAULT_AVATAR}
                    alt="Comentário"
                    width={24}
                    height={24}
                    className="rounded-full"
                    placeholder="blur"
                    blurDataURL={DEFAULT_AVATAR}
                  />
                  <p className="bg-gray-100 dark:bg-zinc-800 rounded-lg px-3 py-1 text-sm break-words">
                    {c}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>
    );
  },
);
PostCard.displayName = "PostCard";

const PostGrid: React.FC<PostGridProps> = ({ data, loading, error }) => {
  const memoizedData = useMemo(() => data, [data]);

  if (loading)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-gray-200 dark:bg-zinc-800 h-60 rounded-2xl"
          />
        ))}
      </div>
    );

  if (error) return <p className="text-center text-red-600 py-8">{error}</p>;

  if (!memoizedData.length)
    return <p className="text-center py-8">Nenhum post encontrado.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
      {memoizedData.map((post) => (
        <PostCard key={post.id} {...post} />
      ))}
    </div>
  );
};

export default PostGrid;
