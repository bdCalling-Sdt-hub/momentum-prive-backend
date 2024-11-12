import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { InterestService } from './interest.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const getAllInterest = catchAsync(async (req: Request, res: Response) => {
  const result = await InterestService.getAllInterest(req.params.userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Interest influencer retrived successfully',
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
    message: 'Interest influencer status updated successfully',
    data: result,
  });
});

export const InterestController = {
  getAllInterest,
  updatedStatus,
};
