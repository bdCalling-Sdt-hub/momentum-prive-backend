import { z } from 'zod';

export const BrandValiation = z.object({
  // image: z.string({ required_error: 'required image' }),
  name: z.string({ required_error: 'required name' }),
  email: z.string({ required_error: 'required email' }).email(),
  whatAppNum: z
    .string({ required_error: 'required whatApp number' })
    .min(4)
    .max(15),
  phnNum: z.string({ required_error: 'required phone number' }).min(4).max(15),
  owner: z.string({ required_error: 'required owner' }),
  country: z.string({ required_error: 'required country' }),
  city: z.string({ required_error: 'required city' }),
  address: z.string({ required_error: 'required address' }),
  code: z.string({ required_error: 'required code' }),
  category: z.string({ required_error: 'required category' }),
  manager: z.string({ required_error: 'required manager' }),
  instagram: z.string({ required_error: 'required instagram' }),
  tiktok: z.string().optional(),
});

export const BrandValiationZodSchema = {
  BrandValiation,
};
