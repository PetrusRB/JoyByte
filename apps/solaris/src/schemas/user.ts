import {z} from "zod"

// username_slug_scheam
export const usernameSlugSchema = z
  .string()
  .regex(/^[a-z0-9]+(\.[a-z0-9]+)*$/, "Slug inválido")
  .max(100);
