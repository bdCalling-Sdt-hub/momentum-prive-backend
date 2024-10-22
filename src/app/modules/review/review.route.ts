import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { ReviewController } from './review.controller';
import { reviewValiationZodSchema } from './review.validation';

const router = express.Router();

router.post(
  '/create-review',
  validateRequest(reviewValiationZodSchema.createReviewValiation),
  ReviewController.createReviewToDB
);

router.get('/', ReviewController.getAllReview);

router.get('/:id', ReviewController.getSingleReview);

router.patch('/:id', ReviewController.updatedReview);

router.delete('/:id', ReviewController.deletedReview);

export const ReviewRoutes = router;
