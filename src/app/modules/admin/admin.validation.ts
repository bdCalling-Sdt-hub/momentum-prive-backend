import { z } from 'zod';

const createAdminZodSchema = z.object({
  fullName: z.string({ required_error: 'FullName is required' }),
  email: z.string({ required_error: 'Email is required' }),
  password: z.string({ required_error: 'Password is required' }),
});

export const AdminValidation = {
  createAdminZodSchema,
};
