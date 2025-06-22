"server only";

import { router } from "@/router";
import { createRouterClient } from "@orpc/server";
import { headers } from "next/headers";

globalThis.$client = createRouterClient(router, {
  context: async () => ({
    headers: await headers(),
  }),
});
