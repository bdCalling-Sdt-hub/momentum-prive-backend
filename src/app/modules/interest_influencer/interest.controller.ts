import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { InterestService } from './interest.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const getAllInterest = catchAsync(async (req: Request, res: Response) => {
  const result = await InterestService.getAllInterest();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Interest retrived successfully',
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

export const InterestController = {
  getAllInterest,
  updatedStatus,
};
