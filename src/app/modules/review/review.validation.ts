import { z } from 'zod';

export const createReviewValiation = z.object({
  body: z.object({
    brand: z.string({ required_error: 'Campaign is required' }),
    influencer: z.string({ required_error: 'Influencer is required' }),
    details: z.string({ required_error: 'Details is required' }),
    rating: z.number().max(5).min(0),
  }),
});

export const reviewValiationZodSchema = {
  createReviewValiation,
};
