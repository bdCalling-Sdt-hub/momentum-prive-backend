import { z } from 'zod';

export const createSubmitProve = z.object({
  track: z.string(),
  instagram: z.string(),
  tiktok: z.string(),
});

export const updatedSubmitProve = z.object({
  track: z.string().optional(),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
});

export const SubmitProveValidation = {
  createSubmitProve,
  updatedSubmitProve,
};
