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
  const result = await CampaignService.getAllCampaigns(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Campaign retrieved successfully',
    data: result,
  });
});
const getAllCampaignsForAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CampaignService.getAllCampaignsForAdmin(req.query);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Campaign retrieved for admin successfully',
      data: result,
    });
  }
);

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
  let image;
  if (req.files && 'image' in req.files && req.files.image[0]) {
    image = `/images/${req.files.image[0].filename}`;
  }

  const data = {
    image,
    ...req.body,
  };

  const result = await CampaignService.updateCampaignToDB(req.params.id, data);
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

const getCampaignforBrand = catchAsync(async (req: Request, res: Response) => {
  const result = await CampaignService.getCampaignforBrand(req.params.brandId);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Campaign retrived successfully',
    data: result,
  });
});

const getCampaignforAllData = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CampaignService.getCampaignforAllData(
      req.params.brandId
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Campaign retrived successfully',
      data: result,
    });
  }
);

const getAllCampaignForInfluencer = catchAsync(
  async (req: Request, res: Response) => {
    const userGender = req.user?.id;

    const result = await CampaignService.getAllCampaignForInfluencer(
      req.query,
      userGender
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Campaign retrived for influencer successfully',
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
  getCampaignforBrand,
  getAllCampaignsForAdmin,
  getCampaignforAllData,
  getAllCampaignForInfluencer,
};
