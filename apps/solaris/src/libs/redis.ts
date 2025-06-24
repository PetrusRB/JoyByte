import { Redis } from "@upstash/redis";
import { getCacheKey } from "./utils";

export const redis = Redis.fromEnv();

/**
 * Pega do cache se existir, ou seta o valor com TTL.
 * @param key - Chave do Redis
 * @param fetcher - Função que retorna os dados
 * @param ttlSeconds - Tempo de cache (em segundos)
 */
export async function getOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds?: number,
): Promise<T> {
  // forçamos o tipo pra string ou null
  const cached = await redis.get<string>(key);

  if (cached) {
    try {
      // desserializa e retorna já como T
      return JSON.parse(cached) as T;
    } catch {
      // cache corrompido? ignora e busca de novo
    }
  }

  // Busca dados frescos
  const fresh = await fetcher();

  // Serializa
  const serialized = JSON.stringify(fresh);

  // Se vier TTL, passa na opção; senão, só seta sem expirar
  if (typeof ttlSeconds === "number") {
    await redis.set(key, serialized, { ex: ttlSeconds });
  } else {
    await redis.set(key, serialized);
  }

  return fresh;
}

/**
 * Deleta todas as chaves que casam com um padrão.
 * ⚠️ Usar com cautela. `pattern` pode ser algo como "posts:*"
 */
export async function delByPattern(pattern: string): Promise<void> {
  const keys = await redis.keys(getCacheKey(pattern));
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
