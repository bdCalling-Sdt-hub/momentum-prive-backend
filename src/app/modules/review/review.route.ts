import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { ReviewController } from './review.controller';
import { reviewValiationZodSchema } from './review.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post(
  '/create-review',
  auth(
    USER_ROLES.BRAND,
    USER_ROLES.INFLUENCER,
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN
  ),
  validateRequest(reviewValiationZodSchema.createReviewValiation),
  ReviewController.createReviewToDB
);

router.get(
  '/',
  auth(
    USER_ROLES.BRAND,
    USER_ROLES.INFLUENCER,
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN
  ),
  ReviewController.getAllReview
);

router.get(
  '/:id',
  auth(
    USER_ROLES.BRAND,
    USER_ROLES.INFLUENCER,
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN
  ),
  ReviewController.getSingleReview
);

router.patch(
  '/:id',
  auth(
    USER_ROLES.BRAND,
    USER_ROLES.INFLUENCER,
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN
  ),
  ReviewController.updatedReview
);

router.delete(
  '/:id',
  auth(
    USER_ROLES.BRAND,
    USER_ROLES.INFLUENCER,
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN
  ),
  ReviewController.deletedReview
);

export const ReviewRoutes = router;
