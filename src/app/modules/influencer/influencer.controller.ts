import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { InfluencerService } from './influencer.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getFilePaths } from '../../../shared/getFilePath';

const updatedInfluencer = catchAsync(async (req: Request, res: Response) => {
  const userEmail = req.user?.email;

  const images = getFilePaths(req.files, 'images');

  const value = {
    image: images,
    ...req.body,
  };

  const result = await InfluencerService.updateInfluencerToDB(userEmail, value);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Influencer updated successfully',
    data: result,
  });
});

const getAllInfluencer = catchAsync(async (req: Request, res: Response) => {
  const { country, city } = req.query;

  const result = await InfluencerService.getAllInfluencer(
    country as string | undefined,
    city as string | undefined
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Influencer retrived successfully',
    data: result,
  });
});

export const InfluencerController = {
  updatedInfluencer,
  getAllInfluencer,
};
