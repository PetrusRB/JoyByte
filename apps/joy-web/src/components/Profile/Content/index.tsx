import { useCachedPosts } from "@/hooks/useCachedPosts";
import { Post } from "@hexagano/backend";
import { Grid3X3, Camera, Heart } from "lucide-react";

interface ProfileContentProps {
  tab: "posts" | "media" | "likes";
  userId: string;
}

const Content = ({ tab, userId }: ProfileContentProps) => {
  const { data: posts, isLoading } = useCachedPosts(userId);

  if (isLoading) return <div className="text-center py-8">Carregando...</div>;

  switch (tab) {
    case "posts":
      return <PostsList posts={posts} />;
    case "media":
      return (
        <div className="text-center py-8">
          <Camera className="w-12 h-12 mx-auto mb-4" />
          <p>Mídias do usuário aparecerão aqui...</p>
        </div>
      );
    case "likes":
      return (
        <div className="text-center py-8">
          <Heart className="w-12 h-12 mx-auto mb-4" />
          <p>Posts curtidos aparecerão aqui.</p>
        </div>
      );
    default:
      return null;
  }
};

const PostsList = ({ posts }: { posts?: Post[] }) => {
  if (!posts?.length) {
    return (
      <div className="text-center py-8">
        <Grid3X3 className="w-12 h-12 mx-auto mb-4" />
        <p>Posts do usuário aparecerão aqui...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

const PostCard = ({ post }: { post: Post }) => (
  <article className="bg-white dark:bg-zinc-950 text-gray-900 dark:text-white border border-zinc-900 p-4 rounded-lg shadow-sm">
    <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
    <time className="text-gray-500 text-sm block mb-2">
      {new Date(post.created_at).toLocaleString()}
    </time>
    <p className="line-clamp-3 mb-2">{post.content}</p>
  </article>
);

export default Content;
