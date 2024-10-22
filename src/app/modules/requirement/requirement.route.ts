import express from 'express';
import { RequirementController } from './requirement.controller';

const router = express.Router();

router.post('/create-requirement', RequirementController.createRequirementToDB);

export const RequirementRoutes = router;
