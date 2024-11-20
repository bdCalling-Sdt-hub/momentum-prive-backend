import { z } from 'zod';

export const BrandValiation = z.object({
  // image: z.string({ required_error: 'required image' }),
  email: z.string({ required_error: 'required email' }).optional(),
  whatAppNum: z
    .string({ required_error: 'required whatApp number' })
    .min(4)
    .max(15)
    .optional(),
  phnNum: z
    .string({ required_error: 'required phone number' })
    .min(4)
    .max(15)
    .optional(),
  owner: z.string({ required_error: 'required owner' }).optional(),
  country: z.string({ required_error: 'required country' }).optional(),
  city: z.string({ required_error: 'required city' }).optional(),
  address: z.string({ required_error: 'required address' }).optional(),
  code: z.string({ required_error: 'required code' }).optional(),
  category: z.string({ required_error: 'required category' }).optional(),
  manager: z.string({ required_error: 'required manager' }).optional(),
  instagram: z.string({ required_error: 'required instagram' }).optional(),
  tiktok: z.string().optional(),
  followersIG: z.string().optional(),
  followersTK: z.string().optional(),
  contactEmail: z.string().optional(),
});

export const BrandValiationZodSchema = {
  BrandValiation,
};
