import { authed } from "@/orpc";
import { UserProfileSchema } from "@/schemas/user";
import { createClient } from "@/db/server";
import { retry } from "@/middlewares/retry";
import { getOrSet, delByPattern } from "@/libs/redis";
import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { getCacheKey } from "@/libs/utils";

// Schema para campos editáveis do usuário atual
const EditableUserFieldsSchema = z
  .object({
    // Informações básicas
    name: z.string().min(1).max(100).trim().optional(),
    picture: z.string().url().optional(),
    bio: z
      .string()
      .max(500, "Passou do limite de caracterias")
      .trim()
      .optional(),
    banner: z.string().url().optional(),

    // Redes sociais
    social_media: z
      .object({
        twitter: z.string().url().optional().or(z.literal("")),
        instagram: z.string().url().optional().or(z.literal("")),
        linkedin: z.string().url().optional().or(z.literal("")),
        github: z.string().url().optional().or(z.literal("")),
        website: z.string().url().optional().or(z.literal("")),
      })
      .strict()
      .optional(),

    // Gêneros (Homem, Mulher, Binario e etc...)
    genre: z.string().min(3).max(17).trim().optional(),

    // Configurações de privacidade
    preferences: z
      .object({
        privacy: z
          .object({
            profile_visibility: z.enum(["public", "private"]).optional(),
          })
          .strict()
          .optional(),
      })
      .strict()
      .optional(),
  })
  .passthrough(); // Permite campos extras mas os ignora

// Cache TTL em segundos
const USER_PROFILE_CACHE_TTL = 300; // 5 minutos
/**
 * Gera chave do cache para perfil do usuário
 */
function getUserProfileCacheKey(userId: string): string {
  return getCacheKey(`user:profile:${userId}`);
}

/**
 * Busca perfil do usuário no banco de dados
 */
async function fetchUserProfileFromDB(userId: string) {
  const supabase = await createClient();

  const { data: user, error } = await supabase
    .from("profiles")
    .select(
      `
      id, raw_user_meta_data, created_at, updated_at,
      banner, email, bio, badge, social_media, genre,
      followers, following, normalized_name, preferences
    `,
    )
    .eq("id", userId)
    .single();

  if (error) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Erro ao buscar perfil",
    });
  }

  return user;
}

/**
 * Atualizar perfil do usuário atual
 */
export const updateCurrentUserProfile = authed
  .use(retry({ times: 2 }))
  .route({
    method: "PATCH",
    path: "/user/profile",
    summary: "Update current user profile",
    tags: ["Profile"],
  })
  .input(EditableUserFieldsSchema)
  .output(
    z.object({
      user: UserProfileSchema,
      rateLimitRemaining: z.number(),
    }),
  )
  .handler(async ({ input, context }) => {
    const userId = context.user.id;
    const supabase = await createClient();
    // Cooldown de 7 dias baseado em updated_at
    const { data: updatedInfo, error: fetchError } = await supabase
      .from("profiles")
      .select("updated_at")
      .eq("id", userId)
      .single();

    if (fetchError || !updatedInfo) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Erro ao verificar o tempo da última atualização.",
      });
    }

    const updatedAt = new Date(updatedInfo.updated_at).getTime();
    const now = Date.now();
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

    if (now - updatedAt < SEVEN_DAYS) {
      const diffMs = SEVEN_DAYS - (now - updatedAt);
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      throw new ORPCError("TOO_MANY_REQUESTS", {
        message: `Você só pode atualizar seu perfil novamente em ${diffDays} dia(s).`,
      });
    }

    // Verificar se o nome já existe (se estiver sendo atualizado)
    if (input.name) {
      const nameExists = await checkNameExists(input.name, userId);
      if (nameExists) {
        throw new ORPCError("CONFLICT", {
          message: "Este nome já está sendo usado por outro usuário",
        });
      }
    }

    // Separar campos por destino
    const { profileFields, authFields } = sanitizeFields(input);

    if (
      Object.keys(profileFields).length === 0 &&
      Object.keys(authFields).length === 0
    ) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Nenhum campo para atualizar",
      });
    }

    try {
      // Buscar dados atuais apenas se necessário para merge
      let currentData = null;
      if (profileFields.preferences || profileFields.social_media) {
        const { data, error } = await supabase
          .from("profiles")
          .select("preferences, social_media, raw_user_meta_data")
          .eq("id", userId)
          .single();

        if (error) throw error;
        currentData = data;
      }

      // Atualizar dados de autenticação (nome/foto) incluindo raw_user_meta_data
      if (Object.keys(authFields).length > 0) {
        // Buscar raw_user_meta_data atual se não foi buscado ainda
        if (!currentData) {
          const { data, error } = await supabase
            .from("profiles")
            .select("raw_user_meta_data")
            .eq("id", userId)
            .single();

          if (error) throw error;
          currentData = data;
        }

        // Merge com raw_user_meta_data existente
        const currentMetaData = currentData?.raw_user_meta_data || {};
        const updatedMetaData = {
          ...currentMetaData,
          ...authFields,
        };

        const { error: authError } = await supabase.auth.updateUser({
          data: updatedMetaData,
        });

        if (authError) {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Erro ao atualizar dados de autenticação",
          });
        }

        // Também atualizar raw_user_meta_data na tabela profiles diretamente
        // para garantir consistência imediata
        const { error: profileMetaError } = await supabase
          .from("profiles")
          .update({
            raw_user_meta_data: updatedMetaData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (profileMetaError) {
          console.warn(
            "Aviso: Erro ao atualizar raw_user_meta_data na tabela profiles:",
            profileMetaError,
          );
          // Não fazer throw aqui pois o auth já foi atualizado
        }
      }

      // Atualizar dados do perfil
      let user;
      if (Object.keys(profileFields).length > 0) {
        const updateData = mergeData(currentData, profileFields);
        updateData.updated_at = new Date().toISOString();

        const { data, error } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", userId)
          .select(
            `
            id, raw_user_meta_data, created_at, updated_at,
            banner, email, bio, badge, social_media, genre,
            followers, following, normalized_name, preferences
          `,
          )
          .single();

        if (error) throw error;
        user = data;
      } else {
        // Buscar dados atuais se só atualizou auth
        user = await fetchUserProfileFromDB(userId);
      }

      // Invalidar cache do usuário após atualização
      await delByPattern(getCacheKey(`user:profile:${userId}`));

      return {
        user,
        rateLimitRemaining: 0,
      };
    } catch (error) {
      if (error instanceof ORPCError) throw error;

      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Erro ao atualizar perfil",
      });
    }
  });

/**
 * Buscar perfil do usuário atual
 */
export const getCurrentUserProfile = authed
  .use(retry({ times: 2 }))
  .route({
    method: "GET",
    path: "/user/profile",
    summary: "Get current user profile",
    tags: ["Profile"],
  })
  .output(
    z.object({
      user: UserProfileSchema,
    }),
  )
  .handler(async ({ context }) => {
    const userId = context.user.id;
    const cacheKey = getUserProfileCacheKey(userId);

    try {
      // Usar getOrSet para buscar do cache ou DB
      const user = await getOrSet(
        cacheKey,
        () => fetchUserProfileFromDB(userId),
        USER_PROFILE_CACHE_TTL,
      );

      return { user };
    } catch (error) {
      if (error instanceof ORPCError) throw error;

      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Erro ao buscar perfil",
      });
    }
  });

// Funções auxiliares

/**
 * Sanitiza e separa campos por destino
 */
function sanitizeFields(input: z.infer<typeof EditableUserFieldsSchema>) {
  const profileFields: Record<string, any> = {};
  const authFields: Record<string, any> = {};

  // Campos para auth.users (raw_user_meta_data)
  if (input.name !== undefined) {
    authFields.full_name = input.name;
    authFields.name = input.name;
  }

  if (input.picture !== undefined) {
    authFields.picture = input.picture;
  }

  // Campos para tabela profiles
  if (input.bio !== undefined) profileFields.bio = input.bio;
  if (input.banner !== undefined) profileFields.banner = input.banner;
  if (input.genre !== undefined) profileFields.genre = input.genre;
  if (input.preferences) profileFields.preferences = input.preferences;

  // Social media (remover campos vazios)
  if (input.social_media) {
    const socialMedia: Record<string, string> = {};
    Object.entries(input.social_media).forEach(([key, value]) => {
      if (value && value.trim()) {
        socialMedia[key] = value.trim();
      }
    });
    if (Object.keys(socialMedia).length > 0) {
      profileFields.social_media = socialMedia;
    }
  }

  return { profileFields, authFields };
}
function normalizeName(name: string): string {
  const accents =
    "áàâãäåāăąÁÀÂÃÄÅĀĂĄéèêëēĕėęěÉÈÊËĒĔĖĘĚíìîïīĭįİÍÌÎÏĪĬĮıóòôõöøōŏőÓÒÔÕÖØŌŎŐúùûüūŭůűųÚÙÛÜŪŬŮŰŲñÑçćčçÇĆČđÐĐģĞğĢħĦıĲĳĸĶĺļľłŁĹĻĽńņňÑŃŅŇŕŗřŔŖŘśşšŚŞŠţťŧŢŤŦýÿÝŸžźżŽŹŻœŒæÆ";
  const replacements =
    "aaaaaaaaaAAAAAAAAAeeeeeeeeeeEEEEEEEEEiiiiiiiiIIIIIIIIiooooooooOOOOOOOOOuuuuuuuuuUUUUUUUUUnNc3cCCCCdDDDgGgGhHiiijkKlllLLLnnnNNNrrrRRRsssSSStttTTTyyYYzzzZZZooaaAA";

  const unaccented = name
    .split("")
    .map((char) => {
      const index = accents.indexOf(char);
      return index !== -1 ? replacements[index] : char;
    })
    .join("");

  return unaccented
    .toLowerCase()
    .trim()
    .replace(/[\s._\-]+/g, "."); // igual ao SQL: substitui espaços, pontos, underlines e hífens por "."
}
/**
 * Verifica se existe outro usuário com o mesmo nome
 */
async function checkNameExists(name: string, currentUserId: string) {
  const supabase = await createClient();

  // Normalizar o nome para comparação (remover espaços extras, lowercase)
  const normalized_name = normalizeName(name);

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .ilike("normalized_name", normalized_name)
    .neq("id", currentUserId)
    .limit(1);

  if (error) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Erro ao verificar nome",
    });
  }

  return data && data.length > 0;
}
/**
 * Merge dados atuais com atualizações
 */
function mergeData(current: any, updates: any) {
  const merged = { ...updates };

  if (current) {
    // Merge preferences
    if (updates.preferences && current.preferences) {
      merged.preferences = {
        ...current.preferences,
        ...updates.preferences,
        privacy: {
          ...current.preferences?.privacy,
          ...updates.preferences?.privacy,
        },
      };
    }

    // Merge social_media
    if (updates.social_media && current.social_media) {
      merged.social_media = {
        ...current.social_media,
        ...updates.social_media,
      };
    }
  }

  return merged;
}
