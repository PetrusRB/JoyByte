import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: "app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Joy Byte API",
        version: "1.0",
      },
      paths: {
        "/api/auth/me": {
          get: {
            summary: "Get current user",
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
      },
    },
  });
  return spec;
};
