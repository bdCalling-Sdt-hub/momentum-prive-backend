import { z } from 'zod';

export const CategoryValiation = z.object({
  categoryName: z.string({ required_error: 'required category name' }),
});

export const updatedCategoryValiation = z.object({
  categoryName: z.string().optional(),
});

export const CategoryValiationZodSchema = {
  CategoryValiation,
  updatedCategoryValiation,
};
