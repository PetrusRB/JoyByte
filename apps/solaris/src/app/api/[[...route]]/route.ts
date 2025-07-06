import { Hono } from "hono";
import { handle } from "hono/vercel";
import { auth } from "@/betterauth/auth";

import postRoutes from "@/routes/post/posts.router";
import userRoutes from "@/routes/user/user.router";
import searchRoutes from "@/routes/search/search.router";
import { User } from "@/schemas/user";

const basePath = "/api";
const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>().basePath(basePath);

app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }
  const parsedUser: User = {
    ...session.user,
    picture: session.user.image ?? "/user.png",
  };

  c.set("user", parsedUser);
  c.set("session", session.session);
  return next();
});

// ✅ Registro manual e modular das rotas
app.route("/user", userRoutes);
app.route("/post", postRoutes);
app.route("/search", searchRoutes);

// Export handlers
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const HEAD = handle(app);
