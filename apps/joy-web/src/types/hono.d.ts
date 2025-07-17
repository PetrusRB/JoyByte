import type { User } from "@hexagano/system/src/schemas/user";

declare module "hono" {
  interface ContextVariableMap {
    user: User;
  }
}
