import { z } from 'zod';

export const createCollaboration = z.object({
  campaign: z.string({ required_error: 'campaign is required' }),
  influencer: z.string({ required_error: 'campaign is influencer' }),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
});

export const updatedCollaboration = z.object({
  campaign: z.string({ required_error: 'campaign is required' }),
  influencer: z.string({ required_error: 'campaign is influencer' }),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
});

export const CollaborationValidation = {
  createCollaboration,
  updatedCollaboration,
};
