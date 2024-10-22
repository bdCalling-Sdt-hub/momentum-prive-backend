import { z } from 'zod';

export const CategoryValiation = z.object({
  body: z.object({
    categoryName: z.string({ required_error: 'required category name' }),
  }),
});

export const updatedCategoryValiation = z.object({
  body: z.object({
    categoryName: z.string().optional(),
  }),
});

export const CategoryValiationZodSchema = {
  CategoryValiation,
  updatedCategoryValiation,
};
