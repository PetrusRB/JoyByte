import { createClient } from "@/db/server";

import { z } from "zod";
import { slugToSearchQuery } from "@/libs/utils";
import { createRouter } from "@/utils/router.utils";
import { zValidator } from "@hono/zod-validator";
import { withAuth } from "@/middlewares/withAuth";
import { HTTPException } from "hono/http-exception";
const TRUSTED_HOSTS = new Set([
  "localhost",
  process.env.NEXT_PUBLIC_ALLOWED_ORIGIN,
]);
const router = createRouter();
/**
 * Lidar com o callback de autenticação
 */
router.get(
  "/callback",
  zValidator(
    "query",
    z.object({
      code: z.string().min(1).max(36),
      next: z
        .string()
        .optional()
        .default("/")
        .refine((val) => val.startsWith("/"), {
          message: "O parâmetro 'next' deve começar com '/'",
        }),
      forwardedHost: z.string().optional(),
    }),
  ),
  async (c) => {
    const { code, next, forwardedHost } = c.req.valid("query");
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl)
      throw new HTTPException(500, { message: "URL base não configurada" });

    let originUrl: URL;
    try {
      originUrl = new URL(baseUrl);
      if (!["http:", "https:"].includes(originUrl.protocol)) throw new Error();
      if (
        !TRUSTED_HOSTS.has(originUrl.hostname) &&
        process.env.NODE_ENV !== "development"
      )
        throw new Error();
    } catch {
      throw new HTTPException(500, { message: "URL base inválida" });
    }

    if (forwardedHost && !TRUSTED_HOSTS.has(forwardedHost)) {
      throw new HTTPException(400, {
        message: "Host encaminhado não permitido",
      });
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return c.redirect(`${originUrl.origin}/auth/auth-code-error`, 307);
    }

    const isLocal = process.env.NODE_ENV === "development";
    const redirectHost = isLocal
      ? originUrl.origin
      : forwardedHost
        ? `https://${forwardedHost}`
        : originUrl.origin;

    const finalRedirect = `${redirectHost}${next}`;
    try {
      new URL(finalRedirect);
    } catch {
      return c.redirect(`${originUrl.origin}/auth/auth-code-error`, 307);
    }

    return c.redirect(finalRedirect, 307);
  },
);
/**
 * Pegar o usuário atual
 * @returns Usuário atual (se estiver authenticado)
 */
router.get("/me", withAuth, async (c) => {
  const user = c.get("user");

  if (!user.email) {
    throw new HTTPException(500, {
      message: "Usuário inválido: email não encontrado",
    });
  }

  return c.json({
    id: user.id,
    email: user.email,
    name: user.user_metadata.name ?? "Sem nome",
    picture: user.user_metadata.picture ?? "/user.png",
    created_at: user.created_at,
    aud: user.aud,
    normalized_name: slugToSearchQuery(
      user.user_metadata.name ?? "Misterioso(a)",
    ),
    preferences: {},
    social_media: {},
  });
});
export default router;
