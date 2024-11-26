import express from 'express';

import { PackageController } from './package.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post(
  '/create-package',
  // auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  PackageController.createPackage
);
router.get('/get-all', PackageController.getAllPackage);

router.patch('/:id', PackageController.updatePackage);

export const PackageRoutes = router;
