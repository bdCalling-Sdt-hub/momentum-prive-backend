import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { ShowInterestService } from './showInterest.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createInviteForInfluencerToDB = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ShowInterestService.createInviteForIncluencerToDB(
      req.body
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Interest show send successfully',
      data: result,
    });
  }
);

export const ShowInterestController = {
  createInviteForInfluencerToDB,
};
