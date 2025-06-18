import { useEffect, useRef, useState } from "react";
import { UserProfile } from "@/types";
import ky from "ky";

export function useUserProfile(rawUsername: string | undefined) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [duplicates, setDuplicates] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cache = useRef<Record<string, UserProfile>>({});
  const abortRef = useRef<AbortController | null>(null);
  const lastFetchedUsername = useRef<string | undefined>(undefined);

  useEffect(() => {
    const username = rawUsername?.trim();
    if (!username || username === lastFetchedUsername.current) return;

    // Se estiver em cache, resolve imediatamente
    if (cache.current[username]) {
      setUser(cache.current[username]);
      setDuplicates([]);
      setLoading(false);
      setError(null);
      lastFetchedUsername.current = username;
      return;
    }

    setLoading(true);
    setError(null);

    // Cancela requisições antigas
    const abortController = new AbortController();
    abortRef.current?.abort();
    abortRef.current = abortController;

    const fetchUser = async () => {
      try {
        const response = await ky.get("/api/search/user", {
          searchParams: { user: username },
          signal: abortController.signal,
        });

        // Se status não ok, tentar extrair mensagem de erro
        if (!response.ok) {
          let msg = `Erro ${response.status}`;
          try {
            const data = await response.json() as any;
            if (data && typeof data.error === "string") msg = data.error;
          } catch (_) {
            // não conseguiu parsear JSON
          }
          throw new Error(msg);
        }

        // parse JSON fora do try de status
        const res = await response.json<{ data: { users: UserProfile[] } }>();
        const users = res.data.users;
        const primary = users[0] ?? null;

        // Atualiza cache e estado
        cache.current[username] = primary;
        lastFetchedUsername.current = username;
        setUser(primary);
        setDuplicates(users.slice(1));
      } catch (err: any) {
        if (!abortController.signal.aborted) {
          const message = err instanceof Error ? err.message : String(err);
          console.error("[useUserProfile] ", message);
          setError(message || "Erro ao buscar perfil");
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      abortController.abort();
    };
  }, [rawUsername]);

  return { user, duplicates, loading, error, setUser, setDuplicates };
}
