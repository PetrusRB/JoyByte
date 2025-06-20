"use client";

import React, { useState, useCallback, memo, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import { formatRelativeTime, getUserSlug } from "@/libs/utils";
import { Post as PostType } from "@/types";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  MoreVertical,
} from "lucide-react";
import { Dropdown } from "antd";
import { useAuth } from "@/contexts/auth/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Input } from "../ui/Input";
import { RequestButton } from "../RequestButton";
import type { MenuProps } from "antd";

// DynamicMedia Lazy
const DynamicMedia = dynamic(() => import("../DynamicMedia"), { ssr: false });
const DynamicMediaSkeleton = () => (
  <div className="animate-pulse bg-gray-200 dark:bg-zinc-800 h-60 w-full rounded-lg" />
);

const DEFAULT_AVATAR = "/user.png";

type PostGridProps = {
  data: PostType[];
  loading: boolean;
  error: string | null;
};

const PostCard: React.FC<PostType> = memo(
  ({ id, title, content, created_at, image, author }) => {
    const { user } = useAuth();
    const router = useRouter();
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
              onClick={() => toast("Editar em construção")}
            >
              Editar
            </button>
          ),
        },
        {
          key: "delete",
          label: (
            <RequestButton
              url="/api/post/delete"
              method="POST"
              body={{ id: id }}
              message="Deletado com sucesso, recarregue a página para visualizar as alterações."
              label="Deletar"
              className="w-full text-left px-4 py-2 dark:text-red-600 text-red-600"
            />
          ),
        },
      ],
      [],
    );

    return (
      <article className="bg-white dark:bg-zinc-950 text-gray-900 dark:text-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden flex flex-col">
        <header className="flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <button
              onClick={handleAvatarClick}
              aria-label="Ver perfil"
              className="flex-shrink-0 w-10 h-10 rounded-full ring-2 ring-blue-500 focus:outline-none focus:ring-4"
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
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 mb-2 line-clamp-4">
            {content}
          </p>
        </div>

        <footer className="px-5 py-3 bg-gray-50 dark:bg-zinc-900 flex items-center justify-between">
          <div className="flex space-x-4">
            <button
              className="flex items-center space-x-1 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800 focus:outline-none transition"
              aria-label="Curtir"
            >
              <ThumbsUp size={18} /> <span className="text-sm">Like</span>
            </button>
            <button
              className="flex items-center space-x-1 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800 focus:outline-none transition"
              aria-label="Deslike"
            >
              <ThumbsDown size={18} /> <span className="text-sm">Dislike</span>
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
                placeholder="blur"
                blurDataURL={DEFAULT_AVATAR}
              />
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicionar comentário..."
                className="flex-grow"
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
