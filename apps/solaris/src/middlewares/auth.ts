import { createClient } from "@/db/server";
import type { User } from "@/schemas/user";
import { ORPCError, os } from "@orpc/server";

export const requiredAuthMiddleware = os
  .$context<{ user?: User }>()
  .middleware(async ({ next, context }) => {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) throw new ORPCError("UNAUTHORIZED");

    const user = {
      ...data.user,
      created_at: new Date(data.user.created_at),
    };

    return next({
      context: {
        ...context,
        user,
      },
    });
  });
