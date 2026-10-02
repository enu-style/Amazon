import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).optional(),
  description: z.string().min(20).max(4000),
  price: z.coerce.number().positive(),
  discountPrice: z.coerce.number().nonnegative().optional().nullable(),
  stock: z.coerce.number().int().min(0).default(0),
  sku: z.string().min(3).max(100),
  brand: z.string().min(2).max(100),
  categoryId: z.string().min(1),
  images: z.array(z.string().url()).optional().default([]),
  rating: z.coerce.number().min(0).max(5).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  slug: z.string().min(2).max(200).optional(),
  description: z.string().min(20).max(4000).optional(),
  price: z.coerce.number().positive().optional(),
  discountPrice: z.coerce.number().nonnegative().optional().nullable(),
  stock: z.coerce.number().int().min(0).optional(),
  sku: z.string().min(3).max(100).optional(),
  brand: z.string().min(2).max(100).optional(),
  categoryId: z.string().min(1).optional(),
  images: z.array(z.string().url()).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  isActive: z.boolean().optional(),
});
