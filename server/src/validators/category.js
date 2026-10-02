import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(80).optional(),
  description: z.string().max(500).optional(),
  image: z.string().url().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).max(80).optional(),
  slug: z.string().min(2).max(80).optional(),
  description: z.string().max(500).optional(),
  image: z.string().url().optional(),
});
