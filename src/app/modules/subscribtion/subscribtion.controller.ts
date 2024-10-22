import { Request, Response } from 'express';
import { subscriptionService } from './subscribtion.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';

const createSession = catchAsync(async (req: Request, res: Response) => {
  const { plan } = req.query;

  // Check if 'plan' is not undefined and is a string
  if (!plan || typeof plan !== 'string') {
    return res.status(400).send('Plan is required and must be a single string');
  }

  const result = await subscriptionService.createCheckoutSession(
    plan.toLowerCase() // This is safe now as we have confirmed 'plan' is a string
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Subscription created successfully',
    data: result,
  });
});

const Success = catchAsync(async (req: Request, res: Response) => {
  const result = await subscriptionService.retrieveSession(
    req.params.id as string
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Subscription successful',
    data: result,
  });
});

const customerPortal = catchAsync(async (req: Request, res: Response) => {
  const result = await subscriptionService.createBillingPortal(
    req.params.id as string
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'createBillingPortal successful',
    data: result,
  });
});

const webhookHandler = catchAsync(async (req: Request, res: Response) => {
  const result = await subscriptionService.handleWebhook(req.body);
  console.log({ result });
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'webhookHandler successful',
    data: result,
  });
});

// subscribtion.controller.ts

const createSubscription = catchAsync(async (req: Request, res: Response) => {
  const { email, priceId } = req.body;

  if (!email || !priceId) {
    return res.status(400).send('Email and Price ID are required');
  }

  try {
    const result = await subscriptionService.createCustomerAndSubscription(
      email,
      priceId
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Subscription created successfully',
      data: result,
    });
  } catch (error) {
    return res.status(500);
  }
});

const updateSubscription = catchAsync(async (req: Request, res: Response) => {
  const { subscriptionId, newPriceId } = req.body;

  const result = await subscriptionService.updateustomerAndSubscription(
    newPriceId,
    subscriptionId
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Subscription updated successfully',
    data: result,
  });
});

const CancelSubscription = catchAsync(async (req, res) => {
  const { subscriptionId } = req.body;

  const result = await subscriptionService.cancelSubscription(subscriptionId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Subscription canceled successfully',
    data: result,
  });
});

const renewExpiredSubscription = catchAsync(async (req, res) => {
  const { subscriptionId } = req.body;

  const result = await subscriptionService.renewExpiredSubscriptions(
    subscriptionId
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Subscription renewExpiredSubscriptions successfully',
    data: result,
  });
});

export const SubscriptionController = {
  createSession,
  Success,
  customerPortal,
  webhookHandler,
  createSubscription,
  updateSubscription,
  CancelSubscription,
  renewExpiredSubscription,
};
