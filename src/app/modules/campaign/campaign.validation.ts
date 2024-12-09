import { z } from 'zod';

const campaignValidation = z.object({
  user: z.string({ required_error: 'required user' }),
  influencer: z.string().optional(),
  name: z.string({ required_error: 'required name' }),
  startTime: z.string({ required_error: 'Start time required' }),
  endTime: z.string({ required_error: 'End time required' }),
  address: z.string({ required_error: 'Address is required' }),
  addressLink: z.string({ required_error: 'AddressLink is required' }),
  gender: z.enum(['Male', 'Female', 'Other', 'All']),
  dressCode: z.string({ required_error: 'Dress code is required' }),
  brandInstagram: z.string({ required_error: 'Instagram is required' }),
  details: z.string({ required_error: 'Details is required' }),
  collaborationLimit: z.string({
    required_error: 'collaborationLimit is required',
  }),
  campaignTermAndCondition: z.string({
    required_error: 'CampaignTermAndCondition is required',
  }),
  rules: z.string().optional(),
  exchange: z.string().optional(),
  // collaboration: z.number().min(0, 'Collaboration must be a positive number'),
  requiredDocuments: z.array(z.string()).optional(),
});

const campaignUpdatedValidation = z.object({
  user: z.string().optional(),
  requiredDocuments: z.array(z.string()).optional(),
  influencer: z.string().optional(),
  name: z.string().optional(),
  rules: z.string().optional(),
  exchange: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  address: z.string().optional(),
  addressLink: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other', 'All']).optional(),
  dressCode: z.string().optional(),
  details: z.string().optional(),
  brandInstagram: z.string().optional(),
  campaignTermAndCondition: z.string().optional(),
  collaborationLimit: z.string().optional(),
  // collaboration: z.number().min(0).optional(),
});

export const CampaignValidationZodSchema = {
  campaignValidation,
  campaignUpdatedValidation,
};
