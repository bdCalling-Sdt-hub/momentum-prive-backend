import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import getFilePath from '../../../shared/getFilePath';
import { DiscountClubService } from './discountClub.service';

const createDiscountClubToDB = catchAsync(
  async (req: Request, res: Response) => {
    let image = getFilePath(req.files, 'images');
    const value = {
      image,
      ...req.body,
    };

    const result = await DiscountClubService.createDiscountToDB(value);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Discount-Club created successfully',
      data: result,
    });
  }
);

const getAllDiscount = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params; // Extract userId from URL params
  const query = { ...req.query, userId }; // Merge userId into query object

  const result = await DiscountClubService.getAllDiscount(query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Discount Club data retrieved successfully',
    data: result,
  });
});
const getAllDiscountForOther = catchAsync(
  async (req: Request, res: Response) => {
    const result = await DiscountClubService.getAllDiscountForOther(req.query);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Discount-Club retrived successfully',
      data: result,
    });
  }
);

const getSingleDiscount = catchAsync(async (req: Request, res: Response) => {
  const result = await DiscountClubService.getSingleDiscount(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Single Discount-Club retrived successfully',
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

  const result = await DiscountClubService.updateDiscountToDB(
    req.params.id,
    data
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Discount-Club updated successfully',
    data: result,
  });
});

const DiscountClubUpdateSatus = catchAsync(
  async (req: Request, res: Response) => {
    const result = await DiscountClubService.DiscountClubUpdateSatus(
      req.params.id,
      req.body
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Discount-Club deleted successfully',
      data: result,
    });
  }
);

export const DiscountClubController = {
  createDiscountClubToDB,
  getAllDiscount,
  getSingleDiscount,
  updateCampaignToDB,
  DiscountClubUpdateSatus,
  getAllDiscountForOther,
};
