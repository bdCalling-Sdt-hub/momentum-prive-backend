// import { z } from 'zod';

// const dateStringSchema = z.string().refine(
//   date => {
//     // Regex to match the "25 Aug 2024" format
//     const regex =
//       /^(0?[1-9]|[12][0-9]|3[01])\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}$/;
//     return regex.test(date);
//   },
//   {
//     message:
//       'Invalid date format, expected "DD MMM YYYY" (e.g., "25 Aug 2024")',
//   }
// );

// const campaignValidation = z
//   .object({
//     user: z.string({ required_error: 'required user' }),
//     influencer: z.string().optional(),
//     name: z.string({ required_error: 'required name' }),
//     startTime: dateStringSchema,
//     endTime: dateStringSchema,
//     address: z.string({ required_error: 'Address is required' }),
//     gender: z.enum(['male', 'female', 'other']),
//     dressCode: z.string({ required_error: 'Dress code is required' }),
//     brandInstagram: z.string({ required_error: 'Instagram is required' }),
//     details: z.string({ required_error: 'Details is required' }),
//     // collaboration: z.number().min(0, 'Collaboration must be a positive number'),
//   })
//   .refine(
//     data => {
//       const start = new Date(data.startTime);
//       const end = new Date(data.endTime);

//       return end > start;
//     },
//     {
//       message: 'Start time should be before End time!',
//     }
//   );

// const campaignUpdatedValidation = z
//   .object({
//     user: z.string().optional(),
//     influencer: z.string().optional(),
//     name: z.string().optional(),
//     rules: z.string().optional(),
//     exchange: z.string().optional(),
//     startTime: dateStringSchema.optional(),
//     endTime: dateStringSchema.optional(),
//     address: z.string().optional(),
//     gender: z.enum(['male', 'female', 'other']),
//     dressCode: z.string().optional(),
//     details: z.string().optional(),
//     brandInstagram: z.string().optional(),
//     // collaboration: z.number().min(0).optional(),
//   })
//   .refine(
//     data => {
//       if (data.startTime && data.endTime) {
//         const start = new Date(data.startTime);
//         const end = new Date(data.endTime);
//         return end > start;
//       }

//       return true;
//     },
//     {
//       message: 'Start time should be before End time!',
//     }
//   );

// export const CampaignValidationZodSchema = {
//   campaignValidation,
//   campaignUpdatedValidation,
// };

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
