import { z } from 'zod';

export const createInviteValiation = z.object({
  body: z.object({
    campaign: z.string({ required_error: 'Campaign is required' }),
    influencer: z.string({ required_error: 'Influencer is required' }),
  }),
});

export const InviteValiationZodSchema = {
  createInviteValiation,
};
