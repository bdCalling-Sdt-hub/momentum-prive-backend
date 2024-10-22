import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { CategoryValiationZodSchema } from './category.validation';
import { CategoryController } from './category.controller';

const router = express.Router();

router.post(
  '/create-category',
  validateRequest(CategoryValiationZodSchema.CategoryValiation),
  CategoryController.createCategoryToDB
);

router.get('/', CategoryController.getAllCategory);
router.get('/:id', CategoryController.getSingleCategory);
router.patch(
  '/:id',
  validateRequest(CategoryValiationZodSchema.updatedCategoryValiation),
  CategoryController.updateCategoryToDB
);
router.delete('/:id', CategoryController.deleteCategory);

export const CategoryRoutes = router;
