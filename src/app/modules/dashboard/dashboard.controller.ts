import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { DashboardService } from './dashboard.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const getAllBrandStatistics = catchAsync(
  async (req: Request, res: Response) => {
    const result = await DashboardService.getAllBrandStatistics();
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Brand Statistics retrived successfully',
      data: result,
    });
  }
);

const getAllInfluencerStatistics = catchAsync(
  async (req: Request, res: Response) => {
    const result = await DashboardService.getAllInfluencerStatistics();
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Influencer Statistics retrived successfully',
      data: result,
    });
  }
);

const getMonthlyEarnings = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getMonthlyEarnings();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Monthly Earnings retrived successfully',
    data: result,
  });
});

const getMonthlyUserRegistration = catchAsync(
  async (req: Request, res: Response) => {
    const year = req.query.year
      ? parseInt(req.query.year as string, 10)
      : undefined;
    const result = await DashboardService.getMonthlyUserRegistration(year);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Monthly Registration User retrieved successfully',
      data: result,
    });
  }
);

export const DashboardController = {
  getAllBrandStatistics,
  getAllInfluencerStatistics,
  getMonthlyEarnings,
  getMonthlyUserRegistration,
};
