"use client"

import { useState, useCallback } from "react";
import { formatRelativeTime } from "@/libs/utils";
import { Post as PostType } from "@/types";
import { ThumbsUp, MessageSquareMore } from "lucide-react";
import { useAuth } from "@/contexts/auth/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import DynamicMedia from "../DynamicMedia";

type PostGridProps = {
  data: PostType | PostType[];
  status: "pending" | "error" | "success";
};

const DEFAULT_AVATAR = "/user.png";

const PostCard: React.FC<PostType> = ({
  id,
  title,
  content,
  createdAt,
  image,
  author
}) => {
  const { user } = useAuth();
  const router = useRouter();

  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  const handleAddComment = useCallback(() => {
    const trimmed = newComment.trim();
    if (trimmed) {
      setComments((prev) => [...prev, trimmed]);
      setNewComment('');
    }
  }, [newComment]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAddComment();
  };

  const handleAvatarClick = () => {
    if (author?.id) router.push(`/user/${author.id}`);
  };

  return (
    <div className="w-full mx-auto my-8">
      <div className="bg-white dark:bg-zinc-950 dark:text-white rounded-xl text-gray-600 shadow-lg overflow-hidden transition hover:shadow-2xl">
        {/* Header */}
        <div className="p-6 flex items-center gap-4 border-b border-gray-200 dark:border-gray-700">
          <Image
            src={author?.avatar || DEFAULT_AVATAR}
            alt={author?.name || "Avatar"}
            width={56}
            height={56}
            onClick={handleAvatarClick}
            className="w-14 h-14 rounded-full ring-2 ring-blue-500 dark:ring-blue-400 cursor-pointer"
          />
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">{formatRelativeTime(createdAt)}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {image && (
            <div className="mb-6 rounded-lg overflow-hidden">
              <DynamicMedia
                url={image}
                alt="Media do post"
                width={600}
                height={400}
                className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          )}
          {content && (
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">{content}</p>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between px-6 py-4 dark:bg-neutral-900 bg-neutral-400">
          <button className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition">
            <ThumbsUp size={24} />
            <span>Curtir</span>
          </button>
          <button
            onClick={() => setShowComments((prev) => !prev)}
            className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition"
          >
            <MessageSquareMore size={24} />
            <span>Comentar</span>
          </button>
        </div>

        {/* Comment Section */}
        {showComments && (
          <div className="p-6 bg-neutral-800 space-y-6">
            <div className="flex items-center gap-4">
              <Image
                src={user?.user_metadata?.picture || DEFAULT_AVATAR}
                alt="Seu avatar"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full"
              />
              <input
                type="text"
                name="comment"
                aria-label="Escreva um comentário"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escreva um comentário..."
                className="flex-grow p-3 border rounded-full bg-neutral-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={handleAddComment}
                className="px-5 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
              >
                Enviar
              </button>
            </div>
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <div key={`${id}-comment-${index}`} className="flex items-start gap-4 bg-neutral-700 p-4 rounded-lg shadow">
                  <Image
                    src={user?.user_metadata?.picture || DEFAULT_AVATAR}
                    alt="Comentário avatar"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-white">{user?.user_metadata?.name || "Você"}</p>
                    <p className="text-gray-300">{comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PostGrid: React.FC<PostGridProps> = ({ data, status }) => {
  if (status === "pending") return <p>Carregando posts...</p>;
  if (status === "error") return <p>Erro ao carregar posts.</p>;
  if (!data || (Array.isArray(data) && data.length === 0)) return <p>Nenhum post encontrado.</p>;

  const posts = Array.isArray(data) ? data : [data];

  return (
    <div className="grid grid-cols-1 gap-6">
      {posts.map((post) => (
        <PostCard key={post.id} {...post} />
      ))}
    </div>
  );
};

export default PostGrid;
