import { Hono } from "hono";
import { handle } from "hono/vercel";
import authRoutes from "@/routes/auth/auth.router";
import postRoutes from "@/routes/post/posts.router";
import userRoutes from "@/routes/user/user.router";
import searchRoutes from "@/routes/search/search.router";

const basePath = "/api";
const app = new Hono().basePath(basePath);

// ✅ Registro manual e modular das rotas
app.route("/auth", authRoutes);
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
