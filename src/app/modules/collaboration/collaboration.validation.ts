import { z } from 'zod';

export const createCollaboration = z.object({
  invite: z.string().optional(),
  influencer: z.string(),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
});

export const updatedCollaboration = z.object({
  invite: z.string().optional(),
  influencer: z.string().optional(),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
});

export const CollaborationValidation = {
  createCollaboration,
  updatedCollaboration,
};
