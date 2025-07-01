import { createClient } from "@/db/server";
import type { MiddlewareHandler } from "hono";
import type { User } from "@/schemas/user";

export const withAuth: MiddlewareHandler = async (c, next) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    console.log("Unauthorized");
    return c.json(
      {
        success: false,
        type: "UNAUTHORIZED",
        message: "Usuário não encontrado.",
      },
      401,
    );
  }

  const user: User = {
    ...data.user,
    user_metadata: data.user.user_metadata,
    created_at: data.user.created_at
      ? new Date(data.user.created_at)
      : undefined,
  };

  c.set("user", user);
  return next();
};
