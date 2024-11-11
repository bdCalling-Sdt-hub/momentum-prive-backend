import express, { NextFunction, Request, Response } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { CategoryValiationZodSchema } from './category.validation';
import { CategoryController } from './category.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

router.post(
  '/create-category',
  fileUploadHandler(),
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = CategoryValiationZodSchema.CategoryValiation.parse(
      JSON.parse(req.body.data)
    );
    return CategoryController.createCategoryToDB(req, res, next);
  }
);

router.get('/', CategoryController.getAllCategory);
router.get('/:id', CategoryController.getSingleCategory);

router.patch(
  '/:id',
  fileUploadHandler(),
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  (req: Request, res: Response, next: NextFunction) => {
    req.body.data
      ? (req.body = CategoryValiationZodSchema.updatedCategoryValiation.parse(
          JSON.parse(req.body.data)
        ))
      : {};
    return CategoryController.updateCategoryToDB(req, res, next);
  }
);

router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  CategoryController.deleteCategory
);

export const CategoryRoutes = router;
