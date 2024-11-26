import { z } from 'zod';

export const InfluencerValiation = z.object({
  address: z.string().optional(),
  whatAppNum: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  zip: z.string().optional(),
  describe: z.string().optional(),
  followersIG: z
    .string()
    .refine(val => !isNaN(Number(val)), {
      message: 'followersIG must be a valid number',
    })
    .optional(),
  followersTK: z
    .string()
    .refine(val => !isNaN(Number(val)), {
      message: 'followersTK must be a valid number',
    })
    .optional(),
  gender: z.enum(['Male', 'Female', 'Other', 'All']).optional(),
  number: z.string().optional(),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  imagesToDelete: z.array(z.string()).optional(),
  contactEmail: z.string().optional(),
});

export const InfluencerValiationZodSchema = {
  InfluencerValiation,
};
