import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { ReviewService } from './review.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createReviewToDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.createReviewToDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Review created successfully',
    data: result,
  });
});

const getAllReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getAllReview(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Review retrived successfully',
    data: result,
  });
});

const getSingleReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getSingleReview(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Single Review retrived successfully',
    data: result,
  });
});

const updatedReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.updateReviewToDB(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Review updated successfully',
    data: result,
  });
});

const deletedReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.deleteReviewToDB(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Review deleted successfully',
    data: result,
  });
});

export const ReviewController = {
  createReviewToDB,
  getAllReview,
  getSingleReview,
  updatedReview,
  deletedReview,
};
