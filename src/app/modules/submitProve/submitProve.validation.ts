import { z } from 'zod';

export const createSubmitProve = z.object({
  campaign: z.string().optional(),
  invite: z.string().optional(),
  influencer: z.string(),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
});

export const updatedSubmitProve = z.object({
  invite: z.string().optional(),
  influencer: z.string().optional(),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
});

export const SubmitProveValidation = {
  createSubmitProve,
  updatedSubmitProve,
};
