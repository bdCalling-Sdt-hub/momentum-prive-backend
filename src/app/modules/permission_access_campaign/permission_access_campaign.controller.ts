import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { updatedCampaignStatusService } from './permission_access_campaign.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const updatedCampaignStatus = catchAsync(
  async (req: Request, res: Response) => {
    const result = await updatedCampaignStatusService.updatedCampaignStatus(
      req.params.id,
      req.body
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Campaign Status Updated Successfully',
      data: result,
    });
  }
);

const getAllCampaigns = catchAsync(async (req: Request, res: Response) => {
  const result = await updatedCampaignStatusService.getAllCampaigns();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Campaign retrived Successfully',
    data: result,
  });
});

export const PermissionAccessCampaignController = {
  updatedCampaignStatus,
  getAllCampaigns,
};
