import { Hono } from "hono";
import { handle } from "hono/vercel";
import { auth } from "@/betterauth/auth";
import { SwaggerUI } from "@hono/swagger-ui";
import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/node";
import { isSpoofedBot } from "@arcjet/inspect";

import postRoutes from "@/routes/post/posts.router";
import userRoutes from "@/routes/user/user.router";
import searchRoutes from "@/routes/search/search.router";
import { User } from "@/schemas/user";
import { openApiDoc } from "@/utils/api.utils";

const basePath = "/api";
const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>().basePath(basePath);

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["ip.src"], // Track requests by IP
  rules: [
    // Shield protects from common attacks e.g. SQL injection
    shield({ mode: "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        // Uncomment to allow these other common bot categories
        // See the full list at https://arcjet.com/bot-list
        //"CATEGORY:MONITOR", // Uptime monitoring services
        //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),
    // Create a token bucket rate limit. Other algorithms are supported.
    tokenBucket({
      mode: "LIVE",
      refillRate: 5, // Refill 5 tokens per interval
      interval: 10, // Refill every 10 seconds
      capacity: 10, // Bucket capacity of 10 tokens
    }),
  ],
});
// Middlewares melhorados
const authMiddleware = async (c: any, next: any) => {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (session?.user) {
      const parsedUser: User = {
        ...session.user,
        picture: session.user.image ?? "/user.png",
      };
      c.set("user", parsedUser);
      c.set("session", session.session);
    }
    return next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return next();
  }
};

const arcjetMiddleware = async (c: any, next: any) => {
  // Skip rate limiting for batch operations
  if (isExcludeRequest(c)) {
    return next();
  }

  try {
    const { tokens, customRules } = getRateLimitConfig(c);
    const decision = await aj.protect(c.req.raw, {
      requested: tokens,
      ...(customRules.length > 0 && { rules: customRules }),
    });

    logArcjetDecision(c, decision);

    if (decision.isDenied()) {
      return handleDeniedDecision(c, decision);
    }

    if (decision.results.some(isSpoofedBot)) {
      return c.json(
        { error: "Forbidden", message: "Spoofed bot detected" },
        403,
      );
    }

    return next();
  } catch (error) {
    console.error("Arcjet error:", error);
    return next(); // Fail open
  }
};

// Helper functions
function isExcludeRequest(c: any): boolean {
  const path = c.req.path;
  const method = c.req.method;

  // Endpoints que devem ser excluídos do rate limit
  const excludeEndpoints = [
    { path: "/api/post/batch-like-data", methods: ["POST"] },
    { path: "/api/post/like", methods: ["POST"] },
    { path: "/api/post/user", methods: ["POST"] },
    { path: "/api/post/get", methods: ["GET"] },
    { path: "/api/search/random", methods: ["GET"] },
    { path: "/api/user/profile", methods: ["GET"] },
    { path: "/api/user/followers", methods: ["GET"] },
    { path: "/api/user/following", methods: ["GET"] },
    { path: "/api/user/follow", methods: ["POST"] },
    { path: "/api/user/following-status", methods: ["GET"] },
  ];

  return excludeEndpoints.some(
    (endpoint) =>
      path.startsWith(endpoint.path) && endpoint.methods.includes(method),
  );
}

function getRateLimitConfig(c: any) {
  const path = c.req.path;
  const method = c.req.method;
  let tokens = 1;
  let customRules: any[] = [];

  // Configurações específicas por endpoint
  if (path.startsWith("/api/search")) {
    tokens = 3;
  } else if (path.startsWith("/api/post") && method === "POST") {
    tokens = 5;
    // Adiciona regra especial para criação de posts
    customRules.push(
      tokenBucket({
        mode: "LIVE",
        refillRate: 2,
        interval: 30,
        capacity: 5,
      }),
    );
  } else if (path.startsWith("/api/user")) {
    tokens = 2;
  }

  return { tokens, customRules };
}

function logArcjetDecision(c: any, decision: any) {
  if (process.env.NODE_ENV === "development") {
    console.log("Arcjet decision:", {
      path: c.req.path,
      method: c.req.method,
      ip: c.req.header("x-forwarded-for") || c.req.header("x-real-ip"),
      conclusion: decision.conclusion,
      reason: decision.reason?.toString(),
    });
  }
}
// Função para lidar com decisões negadas
function handleDeniedDecision(c: any, decision: any) {
  const responseData = {
    error: "Forbidden",
    message: "Request denied",
    ...(decision.reason.isRateLimit() && {
      error: "Too many requests",
      message: "Rate limit exceeded",
      resetTime: decision.reason.resetTime,
    }),
  };

  if (decision.reason.isRateLimit()) {
    c.header("X-RateLimit-Reset", decision.reason.resetTime?.toString() || "");
    return c.json(responseData, 429);
  }

  return c.json(responseData, 403);
}

// Middleware de CORS (opcional, mas recomendado)
app.use("*", async (c, next) => {
  // CORS headers
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (c.req.method === "OPTIONS") {
    return c.text("", 200);
  }

  return next();
});

// Aplicar middlewares na ordem correta
app.use("*", arcjetMiddleware);
app.use("*", authMiddleware);

// Open API
app.get("/docjson", (c) => c.json(openApiDoc));
app.get("/docs", (c) => {
  return c.html(`
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Custom Swagger" />
        <title>Joy Byte API</title>
        <script>
          // custom script
        </script>
        <style>
          /* custom style */
        </style>
      </head>
      ${SwaggerUI({ url: "/api/docjson" })}
    </html>
  `);
});

// Registro manual e modular das rotas
app.route("/user", userRoutes);
app.route("/post", postRoutes);
app.route("/search", searchRoutes);
// Error handler global
app.onError((err, c) => {
  console.error("API Error:", err);
  return c.json(
    {
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Something went wrong",
    },
    500,
  );
});

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: "Not Found",
      message: "The requested endpoint does not exist",
    },
    404,
  );
});
// Export handlers
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const HEAD = handle(app);
