import express from 'express';

import { PackageController } from './package.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post(
  '/create-package',
  auth(USER_ROLES.BRAND),
  PackageController.createPackage
);

router.get('/', PackageController.getAllPackage);

export const PackageRoutes = router;
