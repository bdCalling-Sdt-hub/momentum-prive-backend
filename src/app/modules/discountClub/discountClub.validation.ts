import { z } from 'zod';

const dateStringSchema = z.string().refine(
  date => {
    // Regex to match the "25 Aug 2024" format
    const regex =
      /^(0?[1-9]|[12][0-9]|3[01])\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}$/;
    return regex.test(date);
  },
  {
    message: `Invalid date format, expected "DD MMM YYYY" (e.g., "25 Aug 2024")`,
  }
);

const createDiscountClubValidation = z
  .object({
    name: z.string({ required_error: 'Name is Required' }),
    buyGuide: z.string({ required_error: 'BuyGuide is Required' }),
    brand: z.string().optional(),
    startTime: dateStringSchema,
    endTime: dateStringSchema,
    price: z.string({ required_error: 'Price is required' }),
    discount: z.string({ required_error: 'Discount is required' }),
    description: z.string({ required_error: 'Description is required' }),
  })
  .refine(
    data => {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);

      return end > start;
    },
    {
      message: 'Start time should be before End time!',
    }
  );

const updatedDiscountClubValidation = z
  .object({
    name: z.string().optional(),
    brand: z.string().optional(),
    buyGuide: z.string().optional(),
    startTime: dateStringSchema,
    endTime: dateStringSchema,
    price: z.string().optional(),
    discount: z.string().optional(),
    description: z.string().optional(),
  })
  .refine(
    data => {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);

      return end > start;
    },
    {
      message: 'Start time should be before End time!',
    }
  );

export const DiscountClubValidation = {
  createDiscountClubValidation,
  updatedDiscountClubValidation,
};
