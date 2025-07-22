"use server";

import { redirect } from "next/navigation";
import { ProviderType } from "@hexagano/backend";
import { auth } from "@/betterauth/auth";
import { logger } from "@/libs/logger";

// Lista branca de providers suportados
const SUPPORTED_PROVIDERS = [
  "google",
  "github",
  "facebook",
  "twitter",
] as const;

// Server-safe redirect wrapper
function redirectToError(params: {
  error: string;
  provider?: string;
  code?: number;
  message?: string;
  details?: string;
}) {
  redirect(`/error?message=${params.message}&code=${params.code}`);
}

export async function login(provider: ProviderType) {
  // Checa se provider é válido e suportado
  if (!SUPPORTED_PROVIDERS.includes(provider)) {
    // Fallback se URL ausente
    redirectToError({
      error: "server_error",
      provider,
      message: "URL de redirecionamento ausente.",
    });
  }
  const callbackURL = `${process.env.NEXT_PUBLIC_BASE_URL}/`;
  const { url } = await auth.api.signInSocial({
    body: {
      provider: provider,
      callbackURL,
    },
  });

  if (!url) {
    redirectToError({
      error: "server_error",
      provider,
      message: "Falha no login.",
    });
    return;
  }
  logger.info("Logado com sucesso.");
  redirect(url);
}
