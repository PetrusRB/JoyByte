import { User } from "@hexagano/backend";

import { useState, useEffect } from "react";

export const useFollowers = (userId: string) => {
  const [followers, setFollowers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchFollowers = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/user/followers?userId=${userId}`);
        if (!res.ok) throw new Error("Erro ao buscar seguidores");
        const data = await res.json();
        setFollowers(data);
      } catch (err: Error | any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [userId]);

  return { followers, loading, error };
};
