import { z } from "zod";

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
});

export const updateCustomerStatusSchema = z.object({
  isActive: z.boolean(),
});
