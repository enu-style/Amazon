import { z } from "zod";

const optionalAddressFields = {
  line2: z.string().max(200).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  email: z.string().email().optional().nullable(),
  isDefault: z.boolean().optional(),
};

export const createAddressSchema = z
  .object({
    fullName: z.string().trim().min(2).max(100),
    line1: z.string().trim().min(3).max(200),
    city: z.string().trim().min(2).max(100),
    state: z.string().trim().min(2).max(100),
    postalCode: z.string().trim().min(2).max(20),
    country: z.string().trim().min(2).max(100).default("US"),
    ...optionalAddressFields,
  })
  .strict();

export const updateAddressSchema = z
  .object({
    fullName: z.string().trim().min(2).max(100).optional(),
    line1: z.string().trim().min(3).max(200).optional(),
    city: z.string().trim().min(2).max(100).optional(),
    state: z.string().trim().min(2).max(100).optional(),
    postalCode: z.string().trim().min(2).max(20).optional(),
    country: z.string().trim().min(2).max(100).optional(),
    ...optionalAddressFields,
  })
  .strict()
  .refine((address) => Object.keys(address).length > 0);

export const updateProfileSchema = z
  .object({
    firstName: z.string().trim().min(2).max(50).optional(),
    lastName: z.string().trim().min(2).max(50).optional(),
    email: z
      .string()
      .trim()
      .email()
      .transform((email) => email.toLowerCase())
      .optional(),
    phone: z.string().trim().max(40).optional().nullable(),
  })
  .strict()
  .refine((profile) => Object.keys(profile).length > 0);
