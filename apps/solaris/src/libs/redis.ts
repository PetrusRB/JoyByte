import { Redis } from "@upstash/redis";
import { CACHE_VERSION, ENV_PREFIX, getCacheKey } from "./utils";

export const redis = Redis.fromEnv();

/**
 * Função segura para pegar do cache (json)
 * @param key - Chave do Redis
 */
export async function getJsonFromCache<T>(key: string): Promise<T | null> {
  try {
    const cachedData = await redis.get(key);
    if (cachedData === null || cachedData === undefined) return null;

    // Verifica se já é um objeto (às vezes o Redis client faz parse automático)
    if (typeof cachedData === "object") return cachedData as T;

    // Garantia de string e limpeza
    const cachedString = String(cachedData)
      .replace(new RegExp(`^${ENV_PREFIX}:`), "")
      .replace(new RegExp(`^${CACHE_VERSION}:`), "")
      .trim();

    try {
      return JSON.parse(cachedString);
    } catch {
      // Se ainda falhar, retorna null para buscar no banco
      return null;
    }
  } catch (error) {
    console.error(`Erro ao acessar cache para key ${key}:`, error);
    return null;
  }
}

/**
 * Função segura para armazenar no cache
 * @param key - Chave do Redis
 * @param data - Dados a serem armazenados
 * @param ttl - Tempo de cache (em segundos)
 */
export async function setJsonInCache(
  key: string,
  data: any,
  ttl?: number,
): Promise<void> {
  const cacheKey = getCacheKey(key);

  try {
    const value = JSON.stringify(data);
    if (ttl) {
      await redis.setex(cacheKey, ttl, value);
    } else {
      await redis.set(cacheKey, value);
    }
  } catch (error) {
    console.error(`Erro ao salvar no cache para key ${cacheKey}:`, error);
  }
}
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
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
