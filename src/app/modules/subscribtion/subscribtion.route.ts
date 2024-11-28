import { Router } from 'express';

import express from 'express';
import { SubscriptionController } from './subscribtion.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = Router();

router.post(
  '/subscribe',
  auth(USER_ROLES.BRAND),
  SubscriptionController.createSubscription
);
router.post(
  '/payment-success',
  // auth(USER_ROLES.BRAND),
  SubscriptionController.handlePaymentSuccess
);

router.post(
  '/renew',
  auth(USER_ROLES.BRAND),
  SubscriptionController.renewExpiredSubscription
);
router.patch(
  '/update',
  auth(USER_ROLES.BRAND),
  SubscriptionController.updateSubscription
);
router.delete(
  '/cancel',
  auth(USER_ROLES.BRAND),
  SubscriptionController.CancelSubscription
);
router.get(
  '/get',
  auth(USER_ROLES.BRAND, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  SubscriptionController.getAllSubscriptation
);

router.get(
  '/get/:userId',
  auth(USER_ROLES.BRAND),
  SubscriptionController.getAllSubscriptationForBrand
);

router.post(
  '/webhook',
  auth(USER_ROLES.BRAND),
  express.raw({ type: 'application/json' }),
  SubscriptionController.webhookHandler
);

router.get('/subscribe', SubscriptionController.createSession);
router.get('/success', SubscriptionController.Success);
router.get('/customers/:id', SubscriptionController.customerPortal);

export const SubscriptionRoutes = router;
