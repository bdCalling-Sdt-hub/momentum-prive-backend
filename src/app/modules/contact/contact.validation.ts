import { z } from 'zod';

export const ContactValiation = z.object({
  details: z.string({ required_error: 'Details is required' }),
  whatAppNum: z.number({ required_error: 'Whatapp number is required ' }),
  email: z.string({ required_error: 'Email number is required ' }),
});

export const updatedContactValiation = z.object({
  details: z.string().optional(),
  whatAppNum: z.number().optional(),
  email: z.string().optional(),
});

export const ContactValiationZodSchema = {
  ContactValiation,
  updatedContactValiation,
};
