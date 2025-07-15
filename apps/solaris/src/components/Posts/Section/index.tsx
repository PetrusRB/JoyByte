"use client";

import React, {
  useMemo,
  useEffect,
  useCallback,
  useRef,
  useState,
} from "react";
import { PostWithCount } from "@/schemas/post";
import { User } from "@/schemas/user";
import { LikeData } from "@/routes/post/posts.router";
import { Posts } from "..";

type PostGridProps = {
  data: PostWithCount[];
  loading: boolean;
  error: string | null;
  user: User | null;
};

const MAX_BATCH_SIZE = 50;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Cache global para dados de like com sincronização
class LikeCache {
  private static instance: LikeCache;
  private cache = new Map<
    number,
    { data: LikeData; timestamp: number; isDirty: boolean }
  >();
  private listeners = new Set<() => void>();

  static getInstance(): LikeCache {
    if (!LikeCache.instance) {
      LikeCache.instance = new LikeCache();
    }
    return LikeCache.instance;
  }

  // Adiciona listener para mudanças no cache
  addListener(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notifica listeners sobre mudanças
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  set(postId: number, data: LikeData, isDirty: boolean = false): void {
    this.cache.set(postId, { data, timestamp: Date.now(), isDirty });
    this.notifyListeners();
  }

  get(postId: number): LikeData | null {
    const cached = this.cache.get(postId);
    if (!cached) return null;

    // Se está "dirty" (modificado localmente), não expira
    if (cached.isDirty) {
      return cached.data;
    }

    // Verifica se o cache expirou para dados não modificados
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      this.cache.delete(postId);
      return null;
    }

    return cached.data;
  }

  // Método para verificar se um post está dirty
  isDirty(postId: number): boolean {
    const cached = this.cache.get(postId);
    return cached ? cached.isDirty : false;
  }

  // Atualiza like localmente (marca como dirty)
  updateLike(postId: number, liked: boolean): void {
    const cached = this.get(postId);
    if (!cached) return;

    const newCount = liked ? cached.count + 1 : cached.count - 1;
    const newData: LikeData = {
      postId,
      liked,
      count: Math.max(0, newCount),
    };

    this.set(postId, newData, true);
  }

  // Atualiza like a partir de evento customizado
  updateLikeFromEvent(postId: number, liked: boolean, count: number): void {
    const newData: LikeData = {
      postId,
      liked,
      count: Math.max(0, count),
    };

    this.set(postId, newData, true);
  }

  // Limpa flag dirty após sincronização bem-sucedida
  markAsSynced(postId: number): void {
    const cached = this.cache.get(postId);
    if (cached) {
      this.cache.set(postId, { ...cached, isDirty: false });
    }
  }

  // Obtém todos os posts que precisam ser sincronizados
  getDirtyPosts(): number[] {
    const dirty: number[] = [];
    this.cache.forEach((value, key) => {
      if (value.isDirty) {
        dirty.push(key);
      }
    });
    return dirty;
  }

  // Método para buscar múltiplos posts
  getMultiple(postIds: number[]): { cached: LikeData[]; missing: number[] } {
    const cached: LikeData[] = [];
    const missing: number[] = [];

    postIds.forEach((id) => {
      const cachedData = this.get(id);
      if (cachedData) {
        cached.push(cachedData);
      } else {
        missing.push(id);
      }
    });

    return { cached, missing };
  }

  // Obtém todos os dados de like para uma lista de posts
  getAllForPosts(postIds: number[]): Map<number, LikeData> {
    const result = new Map<number, LikeData>();
    postIds.forEach((id) => {
      const data = this.get(id);
      if (data) {
        result.set(id, data);
      }
    });
    return result;
  }
}

// Hook customizado para gerenciar likes com sincronização
const useLikeData = (postIds: number[], user: User | null) => {
  const cache = useMemo(() => LikeCache.getInstance(), []);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchingRef = useRef(new Set<number>());
  const fetchedOnceRef = useRef(new Set<number>());
  const syncedDirtyRef = useRef(new Set<number>()); // <- NOVO
  const [likeDataMap, setLikeDataMap] = useState<Map<number, LikeData>>(
    new Map(),
  );

  const fetchLikeData = useCallback(
    async (ids: number[]) => {
      if (!user || !ids.length) return;

      const toFetch = ids.filter((id) => !fetchingRef.current.has(id));
      if (!toFetch.length) return;

      toFetch.forEach((id) => fetchingRef.current.add(id));
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      try {
        const chunks = Array.from(
          { length: Math.ceil(toFetch.length / MAX_BATCH_SIZE) },
          (_, i) => toFetch.slice(i * MAX_BATCH_SIZE, (i + 1) * MAX_BATCH_SIZE),
        );

        const results = await Promise.all(
          chunks.map((chunk) =>
            fetch("/api/post/batch-like-data", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ids: chunk }),
              signal: abortControllerRef.current?.signal,
            }).then((res) => {
              if (!res.ok) throw new Error("Erro ao buscar dados de curtida");
              return res.json();
            }),
          ),
        );

        results.flat().forEach(({ postId, liked, count }) => {
          cache.set(postId, { postId, liked, count }, false);
          fetchedOnceRef.current.add(postId);
          syncedDirtyRef.current.delete(postId); // reset após sync
          window.dispatchEvent(
            new CustomEvent("likeUpdate", { detail: { postId, liked, count } }),
          );
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError")
          console.error("Erro no fetch:", err);
      } finally {
        toFetch.forEach((id) => fetchingRef.current.delete(id));
      }
    },
    [user],
  );

  const updateLocalState = useCallback(() => {
    setLikeDataMap(cache.getAllForPosts(postIds));

    // Sincroniza dirty assim que detecta mudança relevante
    const dirty = cache
      .getDirtyPosts()
      .filter((id) => !syncedDirtyRef.current.has(id));

    if (dirty.length) {
      syncedDirtyRef.current = new Set([...syncedDirtyRef.current, ...dirty]);
      fetchLikeData(dirty);
    }
  }, [postIds, fetchLikeData]);

  const handleLikeUpdate = useCallback(
    (e: Event) => {
      const { postId, liked, count } = (e as CustomEvent).detail;
      if (postIds.includes(postId)) {
        cache.updateLikeFromEvent(postId, liked, count);
      }
    },
    [postIds],
  );

  useEffect(() => {
    if (!user || postIds.length === 0) return;

    updateLocalState();
    const unsubscribe = cache.addListener(updateLocalState);
    window.addEventListener("likeUpdate", handleLikeUpdate);

    const { missing } = cache.getMultiple(postIds);
    const newMissing = missing.filter((id) => !fetchedOnceRef.current.has(id));
    if (newMissing.length) fetchLikeData(newMissing);

    return () => {
      unsubscribe();
      window.removeEventListener("likeUpdate", handleLikeUpdate);
      abortControllerRef.current?.abort();

      const dirty = cache
        .getDirtyPosts()
        .filter((id) => !syncedDirtyRef.current.has(id));

      if (dirty.length) {
        fetchLikeData(dirty);
      }
    };
  }, [user, postIds, updateLocalState, handleLikeUpdate, fetchLikeData]);

  return { likeDataMap };
};
// Componente de esqueleto otimizado
const SkeletonCard = React.memo(() => (
  <div className="bg-gray-200 dark:bg-zinc-800 h-60 rounded-2xl animate-pulse" />
));

SkeletonCard.displayName = "SkeletonCard";

// Componente de loading otimizado
const LoadingGrid = React.memo(({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
    {Array.from({ length: count }, (_, i) => (
      <SkeletonCard key={`skeleton-${i}`} />
    ))}
  </div>
));

LoadingGrid.displayName = "LoadingGrid";

// Componente de erro otimizado
const ErrorState = React.memo(({ error }: { error: string }) => (
  <div className="text-center py-8">
    <p className="text-red-600 mb-4">{error}</p>
    <button
      onClick={() => window.location.reload()}
      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
    >
      Tentar novamente
    </button>
  </div>
));

ErrorState.displayName = "ErrorState";

// Componente de estado vazio otimizado
const EmptyState = React.memo(() => (
  <div className="text-center py-12">
    <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
      Nenhum post encontrado.
    </p>
    <p className="text-gray-500 dark:text-gray-500">
      Seja o primeiro a compartilhar algo!
    </p>
  </div>
));

EmptyState.displayName = "EmptyState";

// Componente de post individual otimizado
const PostCard = React.memo(
  ({
    post,
    user,
    likeData,
  }: {
    post: PostWithCount;
    user: User | null;
    likeData?: LikeData;
  }) => {
    const postProps = {
      ...post,
      liked: likeData?.liked ?? false,
      likes: likeData?.count ?? 0,
    };

    return <Posts.Card {...postProps} user={user} likeData={likeData} />;
  },
);

PostCard.displayName = "PostCard";

// Componente principal otimizado
const PostGrid: React.FC<PostGridProps> = ({ data, loading, error, user }) => {
  const memoizedData = useMemo(() => data, [data]);
  const postIds = useMemo(
    () => memoizedData.map((post) => Number(post.id)),
    [memoizedData],
  );

  const { likeDataMap } = useLikeData(postIds, user);

  // Renderização condicional otimizada
  if (loading) return <LoadingGrid />;
  if (error) return <ErrorState error={error} />;
  if (!memoizedData.length) return <EmptyState />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
      {memoizedData.map((post) => {
        const likeData = likeDataMap.get(Number(post.id));
        return (
          <PostCard key={post.id} post={post} user={user} likeData={likeData} />
        );
      })}
    </div>
  );
};

PostGrid.displayName = "PostGrid";

export default React.memo(PostGrid);
