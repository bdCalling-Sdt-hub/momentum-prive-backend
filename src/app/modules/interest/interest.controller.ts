import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { InterestService } from './interest.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const getAllInterest = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { status } = req.query;
  const result = await InterestService.getAllInterest(userId, status as string);

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

const getSingle = catchAsync(async (req: Request, res: Response) => {
  const result = await InterestService.getSingleInterest(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Get Single Interest influencer successfully',
    data: result,
  });
});

export const InterestController = {
  getAllInterest,
  updatedStatus,
  getSingle,
};
