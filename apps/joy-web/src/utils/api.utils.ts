export const openApiDoc = {
  openapi: "3.0.0",
  info: {
    title: "Joy API Docs",
    version: "1.0.0",
    description: "Here has all routes of the API.",
  },
  paths: {
    "/api/user/profile": {
      get: {
        summary: "Get current profile(user)",
        tags: ["User"],
        responses: {
          "200": {
            description: "OK",
          },
        },
      },
    },
    "/api/user/followers": {
      get: {
        summary: "Get all followers on a specific profile",
        tags: ["User"],
        parameters: [
          {
            name: "userId",
            in: "query",
            required: true,
            schema: {
              type: "string",
            },
            description: "User id of author",
          },
        ],
        responses: {
          "200": {
            description: "OK",
          },
        },
      },
    },
    "/api/user/following": {
      get: {
        summary: "Get all following on a specific profile",
        tags: ["User"],
        parameters: [
          {
            name: "userId",
            in: "query",
            required: true,
            schema: {
              type: "string",
            },
            description: "User id of author",
          },
        ],
        responses: {
          "200": {
            description: "OK",
          },
        },
      },
    },
    "/api/user/following-status": {
      get: {
        summary:
          "Get following status on a specific profile, if user is following author",
        tags: ["User"],
        parameters: [
          {
            name: "userId",
            in: "query",
            required: true,
            schema: {
              type: "string",
            },
            description: "User id of author",
          },
        ],
        responses: {
          "200": {
            description: "OK",
          },
        },
      },
    },
    "/api/user/posts/count": {
      post: {
        summary: "Get user posts count",
        tags: ["User"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  userId: { type: "string" },
                },
                required: ["user id"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
          },
        },
      },
    },
    "/api/user/follow": {
      post: {
        summary: "Follow a user",
        tags: ["User"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  id: { type: "string" },
                },
                required: ["user id"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
          },
        },
      },
    },
    "/api/post/batch-like-data": {
      post: {
        summary: "Pegar likes de posts",
        tags: ["Posts"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  ids: { type: "number" },
                },
                required: ["Post ids"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
          },
        },
      },
    },
    "/api/post/delete": {
      post: {
        summary: "Delete current user posts",
        tags: ["Posts"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  post_id: { type: "number" },
                },
                required: ["Post id"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
          },
        },
      },
    },
    "/api/post/user": {
      post: {
        summary: "Get User posts",
        tags: ["Posts"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  user_id: { type: "string" },
                  limit: { type: "number", default: 10 },
                  offset: { type: "number", default: 0 },
                },
                required: ["user id"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
          },
        },
      },
    },
    "/api/search/user": {
      get: {
        summary: "Search a user profile by username",
        tags: ["Search"],
        parameters: [
          {
            name: "user",
            in: "query",
            required: true,
            schema: {
              type: "string",
            },
            description: "Search filter for the username",
          },
          {
            name: "limit",
            in: "query",
            required: false,
            schema: {
              type: "integer",
              default: 10,
            },
            description: "Limit the number of results returned",
          },
          {
            name: "offset",
            in: "query",
            required: false,
            schema: {
              type: "integer",
              default: 0,
            },
            description: "Offset for pagination",
          },
        ],
        responses: {
          "200": {
            description: "OK",
          },
        },
      },
    },
    "/api/search/random": {
      get: {
        summary: "Search a user profile randomly on database",
        tags: ["Search"],
        parameters: [
          {
            name: "limit",
            in: "query",
            required: false,
            schema: {
              type: "integer",
              default: 5,
            },
            description: "Limit the number of results returned",
          },
          {
            name: "offset",
            in: "query",
            required: false,
            schema: {
              type: "integer",
              default: 0,
            },
            description: "Offset for pagination",
          },
        ],
        responses: {
          "200": {
            description: "OK",
          },
        },
      },
    },
  },
  tags: [
    {
      name: "User",
      description: "Operations related to users",
    },
    {
      name: "Posts",
      description: "Operations related to posts",
    },
    {
      name: "Search",
      description: "Operations related to searching",
    },
  ],
};
