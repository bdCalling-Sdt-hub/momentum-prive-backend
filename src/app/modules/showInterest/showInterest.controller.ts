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

const updateInterestStatusToDB = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ShowInterestService.updateInterestStatus(
      req.params.id,
      req.body
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Interest status updated successfully',
      data: result,
    });
  }
);

const getAllShowInterest = catchAsync(async (req: Request, res: Response) => {
  const { influencerId } = req.params;

  const result = await ShowInterestService.getAllShowInterest(influencerId);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Interest show retrived successfully',
    data: result,
  });
});

const getAllShowInterestForBrand = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.params.userId;

    const result = await ShowInterestService.getAllShowInterestForBrand(userId);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Interest show for brand retrived successfully',
      data: result,
    });
  }
);

const getOneShowInterest = catchAsync(async (req: Request, res: Response) => {
  const result = await ShowInterestService.getOneShowInterest(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Interest show for brand single retrived successfully',
    data: result,
  });
});

export const ShowInterestController = {
  createInviteForInfluencerToDB,
  updateInterestStatusToDB,
  getAllShowInterest,
  getAllShowInterestForBrand,
  getOneShowInterest,
};
