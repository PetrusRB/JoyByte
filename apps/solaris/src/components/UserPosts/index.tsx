"use client";

import { FC } from "react";
import { useCachedPosts } from "@/hooks/useCachedPosts";
import { Loading } from "@/components/Loading";

interface PostsListProps {
  userId: string;
}

export const PostsList: FC<PostsListProps> = ({ userId }) => {
  const { data: posts, isLoading, isError } = useCachedPosts(userId);

  if (isLoading) return <Loading />;
  if (isError) return <p>Erro ao carregar posts.</p>;
  if (!posts || posts.length === 0) return <p>Sem posts para mostrar.</p>;

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <article key={post.id} className="p-4 border rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
          <time className="text-gray-500 text-sm block mb-2">
            {new Date(post.created_at).toLocaleString()}
          </time>
          <p className="line-clamp-3 mb-2">{post.content}</p>
        </article>
      ))}
    </div>
  );
};
