import { authed } from "@/orpc";
import { UserSchema } from "@/schemas/user";
import { createClient } from "@/db/server";
import { retry } from "@/middlewares/retry";
import { z } from "zod";
import { ORPCError, os } from "@orpc/server";
const TRUSTED_HOSTS = new Set([
  "localhost",
  process.env.NEXT_PUBLIC_ALLOWED_ORIGIN,
]);
const DetailedRedirectOutput = z.object({
  status: z.literal(307),
  headers: z.object({
    location: z.string().url(),
  }),
});
/**
 * Lidar com o callback de autenticação
 */
export const authCallback = os
  .use(retry({ times: 3 }))
  .route({
    method: "GET",
    path: "/auth/callback",
    summary: "Callback da autenticação OAuth",
    tags: ["Authentication"],
    successStatus: 307,
    outputStructure: "detailed",
  })
  .input(
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
  )
  .output(DetailedRedirectOutput)
  .handler(async ({ input }) => {
    const { code, next, forwardedHost } = input;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!baseUrl) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "URL base não configurada",
      });
    }

    let originUrl: URL;
    try {
      originUrl = new URL(baseUrl);
      if (!["http:", "https:"].includes(originUrl.protocol)) {
        throw new Error("Protocolo inválido");
      }
      if (
        !TRUSTED_HOSTS.has(originUrl.hostname) &&
        process.env.NODE_ENV !== "development"
      ) {
        throw new Error("Host não confiável");
      }
    } catch (err) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "URL base inválida",
      });
    }

    if (forwardedHost && !TRUSTED_HOSTS.has(forwardedHost)) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Host encaminhado não permitido",
      });
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return {
        status: 307,
        headers: {
          location: `${originUrl.origin}/auth/auth-code-error`,
        },
      };
    }

    const isLocalEnv = process.env.NODE_ENV === "development";
    const redirectHost = isLocalEnv
      ? originUrl.origin
      : forwardedHost
        ? `https://${forwardedHost}`
        : originUrl.origin;

    const finalRedirect = `${redirectHost}${next}`;

    try {
      new URL(finalRedirect);
    } catch {
      return {
        status: 307,
        headers: {
          location: `${originUrl.origin}/auth/auth-code-error`,
        },
      };
    }

    return {
      status: 307,
      headers: {
        location: finalRedirect,
      },
    };
  });
/**
 * Pegar o usuário atual
 * @returns Usuário atual (se estiver authenticado)
 */
export const me = authed
  .route({
    method: "GET",
    path: "/auth/me",
    summary: "Get the current user",
    tags: ["Authentication"],
  })
  .output(UserSchema)
  .handler(async ({ context }) => {
    const user = context.user;

    if (!user.email) {
      throw new Error("Usuário inválido: email não encontrado");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name ?? "Sem nome",
      picture: user.user_metadata?.picture ?? "/user.png",
      created_at: new Date(user.created_at),
      aud: user.aud,
    };
  });
