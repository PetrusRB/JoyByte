import { createClient } from "@/db/server";
import type { User } from "@/schemas/user";
import { ORPCError, os } from "@orpc/server";

export const requiredAuthMiddleware = os
  .$context<{ session?: { user?: User } }>()
  .middleware(async ({ next }) => {
    const supabase = await createClient();
    const { data: session } = await supabase.auth.getUser();

    if (!session?.user) {
      throw new ORPCError("UNAUTHORIZED");
    }

    return next({
      context: { user: session.user },
    });
  });
