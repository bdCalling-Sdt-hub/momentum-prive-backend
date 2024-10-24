import express from 'express';

import { PackageController } from './package.controller';

const router = express.Router();

router.post('/create-package', PackageController.createPackage);

router.get('/', PackageController.getAllPackage);

export const PackageRoutes = router;
