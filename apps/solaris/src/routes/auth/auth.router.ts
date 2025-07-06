import { slugToSearchQuery } from "@/libs/utils";
import { createRouter } from "@/utils/router.utils";

import { HTTPException } from "hono/http-exception";

const router = createRouter();

/**
 * Pegar o usuário atual
 * @returns Usuário atual (se estiver authenticado)
 */
router.get("/me", async (c) => {
  const user = c.get("user");

  if (!user.email) {
    throw new HTTPException(500, {
      message: "Usuário inválido: email não encontrado",
    });
  }

  return c.json({
    id: user.id,
    email: user.email,
    name: user.name ?? "Sem nome",
    picture: user.picture ?? "/user.png",
    created_at: user.created_at,
    normalized_name: slugToSearchQuery(user.name ?? "Misterioso(a)"),
    preferences: {},
    social_media: {},
  });
});
export default router;
