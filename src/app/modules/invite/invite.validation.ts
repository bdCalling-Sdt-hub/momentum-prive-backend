import { z } from 'zod';

export const createInviteValiation = z.object({
  body: z.object({
    campaign: z.string({ required_error: 'Campaign is required' }),
    influencer: z
      .string({ required_error: 'Influencer is required' })
      .optional(),
    gender: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
  }),
});

export const InviteValiationZodSchema = {
  createInviteValiation,
};
