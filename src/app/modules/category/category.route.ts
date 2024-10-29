import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { CategoryValiationZodSchema } from './category.validation';
import { CategoryController } from './category.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post(
  '/create-category',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(CategoryValiationZodSchema.CategoryValiation),
  CategoryController.createCategoryToDB
);

router.get(
  '/',
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.BRAND,
    USER_ROLES.INFLUENCER
  ),
  CategoryController.getAllCategory
);
router.get(
  '/:id',
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.BRAND,
    USER_ROLES.INFLUENCER
  ),
  CategoryController.getSingleCategory
);
router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(CategoryValiationZodSchema.updatedCategoryValiation),
  CategoryController.updateCategoryToDB
);
router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  CategoryController.deleteCategory
);

export const CategoryRoutes = router;
