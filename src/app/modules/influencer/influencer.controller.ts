import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { InfluencerService } from './influencer.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import getFilePath, { getFilePaths } from '../../../shared/getFilePath';

// const updatedInfluencer = catchAsync(async (req: Request, res: Response) => {
//   const influencerId = req.params.id;
//   const influencerData = req.body;

//   let image = getFilePath(req.files, 'images');
//   console.log(req.files);
//   const value = {
//     image,
//     ...req.body,
//   };

//   const result = await InfluencerService.updateInfluencerToDB(
//     influencerId,
//     value
//   );
//   sendResponse(res, {
//     success: true,
//     statusCode: StatusCodes.OK,
//     message: 'Influencer updated successfully',
//     data: result,
//   });
// });

const updatedInfluencer = catchAsync(async (req: Request, res: Response) => {
  const influencerId = req.params.id;
  const influencerData = req.body;

  let images = getFilePaths(req.files, 'images');

  const value = {
    image: images,
    ...influencerData,
  };

  const result = await InfluencerService.updateInfluencerToDB(
    influencerId,
    value
  );

  // Send the response
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Influencer updated successfully',
    data: result,
  });
});

const getAllInfluencer = catchAsync(async (req: Request, res: Response) => {
  const filter = req.body;

  const result = await InfluencerService.getAllInfluencer(req.query, filter);
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
