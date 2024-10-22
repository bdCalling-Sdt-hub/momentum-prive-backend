// import { z } from 'zod';

// const createSubscribationZodSchema = z.object({
//   body: z.object({
//     brand: z.string({ required_error: 'Brand is required' }),
//     category: z.enum(['Gold', 'Silver', 'Discount']),
//     price: z.string({ required_error: 'Price is required' }),
//     startTime: z.string().nonempty('Start time is required'),
//     endTime: z.string().nonempty('End time is required'),
//     status: z.enum(['active', 'deleted']).optional(),
//     option1: z.string().optional(),
//     option2: z.string().optional(),
//     option3: z.string().optional(),
//   }),
// });

import { z } from 'zod';

const dateStringSchema = z.string().refine(
  date => {
    const regex =
      /^(0?[1-9]|[12][0-9]|3[01])\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}$/;
    return regex.test(date);
  },
  {
    message:
      'Invalid date format, expected "DD MMM YYYY" (e.g., "25 Aug 2024")',
  }
);

const createSubscribationZodSchema = z.object({
  body: z
    .object({
      brand: z.string({ required_error: 'Brand is required' }),
      category: z.enum(['Gold', 'Silver', 'Discount']),
      price: z.string({ required_error: 'Price is required' }),
      startTime: dateStringSchema,
      endTime: dateStringSchema,
      option1: z.string().optional(),
      option2: z.string().optional(),
      option3: z.string().optional(),
    })
    .refine(
      body => {
        const start = new Date(body.startTime);
        const end = new Date(body.endTime);

        return end > start;
      },
      {
        message: 'Start time should be before End time!',
      }
    ),
});

export const SubscribationValidationZodSchema = {
  createSubscribationZodSchema,
};
