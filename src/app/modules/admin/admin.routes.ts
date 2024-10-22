import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { AdminController } from './admin.controller';
import validateRequest from '../../middlewares/validateRequest';
import { AdminValidation } from './admin.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
const router = express.Router();

router.post(
  '/create-admin',
  auth(USER_ROLES.SUPER_ADMIN),
  fileUploadHandler(),

  (req: Request, res: Response, next: NextFunction) => {
    req.body = AdminValidation.createAdminZodSchema.parse(
      JSON.parse(req.body.data)
    );
    return AdminController.createAdmin(req, res, next);
  }
);
router.get(
  '/get-admin',
  auth(USER_ROLES.SUPER_ADMIN),
  AdminController.getAdmin
);

router.delete(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN),
  AdminController.deleteAdmin
);

export const AdminRoutes = router;
