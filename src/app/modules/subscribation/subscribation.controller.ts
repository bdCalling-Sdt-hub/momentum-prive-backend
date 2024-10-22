import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SubscriptationService } from './subscribation.service';

const createSubscriptationToDB = catchAsync(async (req, res, next) => {
  const result = await SubscriptationService.createSubscriptationToDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Subscriptation created successfully',
    data: result,
  });
});

const getAllSubscriptation = catchAsync(async (req, res, next) => {
  const result = await SubscriptationService.getAllSubscriptation();
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Subscriptation retrived successfully',
    data: result,
  });
});

const createPaymentStripe = async (req: Request, res: Response) => {
  req.body = {
    ...req.body,
    user: req.user, // Now the user property is recognized
  };

  const result = await SubscriptationService.createPaymentStripeService(
    req.body,
    req as any
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Payment created successfully',
    data: result,
  });
};

export const SubscribationController = {
  createSubscriptationToDB,
  getAllSubscriptation,
  createPaymentStripe,
};
