import express, { NextFunction, Request, Response } from 'express';
import { InterestController } from './interest.controller';

const router = express.Router();

router.get('/get', InterestController.getAllInterest);

router.patch('/:id', InterestController.updatedStatus);

export const InterestRoutes = router;
