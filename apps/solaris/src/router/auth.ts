import { authed } from "@/orpc";
import { UserSchema } from "@/schemas/user";
import { createClient } from "@/db/server";
import { retry } from "@/middlewares/retry";
import { z } from "zod";
import { ORPCError, os } from "@orpc/server";
const TRUSTED_HOSTS = new Set(["localhost", process.env.NEXT_PUBLIC_BASE_URL]);
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
      code: z.string().min(1, "Código de autenticação ausente").max(36),
      next: z
        .string()
        .optional()
        .default("/")
        .refine((val) => val.startsWith("/"), {
          message:
            "O parâmetro 'next' deve ser um caminho relativo começando com '/'",
        }),
      forwardedHost: z.string().optional(),
    }),
  )
  .handler(async ({ input }) => {
    const { code, next, forwardedHost } = input;

    // Log de entrada para depuração (evita logar código completo por segurança)
    console.debug("Auth callback input:", {
      code: code.replace("#_=_", ""),
      next,
      forwardedHost,
      timestamp: new Date().toISOString(),
    });

    // Usa NEXT_PUBLIC_BASE_URL como URL base
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      console.error("NEXT_PUBLIC_BASE_URL não configurado");
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Configuração do servidor incompleta: URL base não definida",
      });
    }

    // Valida baseUrl
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
        throw new Error("Domínio não confiável");
      }
    } catch (error) {
      console.error("Base URL inválida:", {
        baseUrl,
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      });
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Configuração de URL base inválida",
      });
    }

    // Valida forwardedHost se fornecido
    if (forwardedHost && !TRUSTED_HOSTS.has(forwardedHost)) {
      console.warn("ForwardedHost não confiável:", forwardedHost);
      throw new ORPCError("BAD_REQUEST", {
        message: "Host encaminhado não permitido",
      });
    }

    // Troca o código OAuth por uma sessão
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Erro ao trocar código por sessão:", {
        code: code.slice(0, 8) + "...",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      return {
        status: 307,
        headers: { location: `${originUrl.origin}/auth/auth-code-error` },
        body: { success: true },
      };
    }

    // Constrói a URL de redirecionamento
    const isLocalEnv = process.env.NODE_ENV === "development";
    const redirectHost = isLocalEnv
      ? originUrl.origin
      : forwardedHost
        ? `https://${forwardedHost}`
        : originUrl.origin;

    const finalRedirect = `${redirectHost}${next}`;

    // Valida a URL de redirecionamento final
    try {
      new URL(finalRedirect);
    } catch {
      console.error("URL de redirecionamento inválida:", {
        finalRedirect,
        timestamp: new Date().toISOString(),
      });
      return {
        status: 307,
        headers: { location: `${originUrl.origin}/auth/auth-code-error` },
        body: { success: true },
      };
    }

    console.info("Redirecionando usuário após autenticação:", {
      redirectUrl: finalRedirect,
      timestamp: new Date().toISOString(),
    });

    // Retorna resposta de redirecionamento
    return {
      status: 307,
      headers: { location: finalRedirect },
      body: { success: true },
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
