import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { CampaignService } from './campaign.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import getFilePath from '../../../shared/getFilePath';
import pick from '../../../shared/pick';
import {
  CampaignFilterableFields,
  CampaignSearchAbleFields,
  paginationFields,
} from './campaign.contant';

const createCampaignToDB = catchAsync(async (req: Request, res: Response) => {
  let image = getFilePath(req.files, 'images');
  const value = {
    image,
    ...req.body,
  };

  const result = await CampaignService.createCampaignToDB(value);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Campaign created successfully',
    data: result,
  });
});

// const getAllCampaigns = catchAsync(async (req: Request, res: Response) => {
//   const result = await CampaignService.getAllCampaigns(req.query);
//   sendResponse(res, {
//     success: true,
//     statusCode: StatusCodes.OK,
//     message: 'Campaign retrived successfully',
//     data: result,
//   });
// });

const getAllCampaigns = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, CampaignFilterableFields);

  const paginationOptions = pick(req.query, paginationFields);
  const result = await CampaignService.getAllCampaigns(
    filters,
    paginationOptions
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Campaign retrieved successfully',
    data: result,
  });
});

const getSingleCmpaign = catchAsync(async (req: Request, res: Response) => {
  const result = await CampaignService.getSingleCmpaign(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Single Campaign retrived successfully',
    data: result,
  });
});

const updateCampaignToDB = catchAsync(async (req: Request, res: Response) => {
  let image = getFilePath(req.files, 'images');
  const value = {
    image,
    ...req.body,
  };

  const result = await CampaignService.updateCampaignToDB(req.params.id, value);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Campaign updated successfully',
    data: result,
  });
});

const deletedCampaignToDB = catchAsync(async (req: Request, res: Response) => {
  const result = await CampaignService.deletedCampaignToDB(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Campaign deleted successfully',
    data: result,
  });
});

const updatedCampaignStatusToDB = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CampaignService.updatedCampaignStatusToDB(
      req.params.userId,
      req.body
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Campaign status updated successfully',
      data: result,
    });
  }
);

export const CampaignController = {
  createCampaignToDB,
  getAllCampaigns,
  getSingleCmpaign,
  updateCampaignToDB,
  deletedCampaignToDB,
  updatedCampaignStatusToDB,
};
