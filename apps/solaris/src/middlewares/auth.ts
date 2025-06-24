import { createClient } from "@/db/server";
import type { User } from "@/schemas/user";
import { ORPCError, os } from "@orpc/server";
let cachedUser: any = null;

export const requiredAuthMiddleware = os
  .$context<{ user?: User }>()
  .middleware(async ({ next, context }) => {
    if (!cachedUser) {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) throw new ORPCError("UNAUTHORIZED");
      cachedUser = data.user;
    }

    context.user = cachedUser;
    // Prossegue, anexando `user` ao contexto
    return next({
      context: {
        ...context,
        user: cachedUser,
      },
    });
  });
