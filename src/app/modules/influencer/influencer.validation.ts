import { z } from 'zod';

export const InfluencerValiation = z.object({
  address: z.string().optional(),
  whatAppNum: z.string().min(4).max(15).optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  fullName: z.string().optional(),
  email: z.string().optional(),
  zip: z.string().optional(),
  describe: z.string().optional(),
  followersIG: z.string().optional(),
  followersTK: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  number: z.string().min(4).max(15).optional(),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  imagesToDelete: z.array(z.string()).optional(),
});

export const InfluencerValiationZodSchema = {
  InfluencerValiation,
};
