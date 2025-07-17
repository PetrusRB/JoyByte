import type { User } from "@/schemas/user";

declare module "hono" {
  interface ContextVariableMap {
    user: User;
  }
}
