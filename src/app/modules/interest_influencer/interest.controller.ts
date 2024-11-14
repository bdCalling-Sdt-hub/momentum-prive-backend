import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { InterestService } from './interest.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const getAllInterest = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { status } = req.query;

  const result = await InterestService.getAllInterest(
    userId as string,
    status as string
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Interests retrieved successfully',
    data: result,
  });
});

const updatedStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await InterestService.updatedInterestStautsToDb(
    req.params.id,
    req.body
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Interest status updated successfully',
    data: result,
  });
});

const getSingleInterest = catchAsync(async (req: Request, res: Response) => {
  const result = await InterestService.getSingleInterest(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Single Interest retrieved successfully',
    data: result,
  });
});

export const InterestController = {
  getAllInterest,
  updatedStatus,
  getSingleInterest,
};
