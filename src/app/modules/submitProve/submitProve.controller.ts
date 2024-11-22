import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { SubmitProveService } from './submitProve.service';
import { getFilePaths } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const submitProveToDB = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  let images = getFilePaths(req.files, 'images');

  const value = {
    image: images,
    ...payload,
  };

  const result = await SubmitProveService.submitProveToDB(value);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Submit prove send successfully',
    data: result,
  });
});

// const getAllSubmitProve = catchAsync(async (req: Request, res: Response) => {
//   const result = await SubmitProveService.getAllSubmitProve(req.params.id);
//   sendResponse(res, {
//     success: true,
//     statusCode: StatusCodes.OK,
//     message: 'Submit prove retrieved successfully',
//     data: result,
//   });
// });

const getAllSubmitProve = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params; // Extract influencer ID
  const { typeStatus } = req.query; // Extract typeStatus from query parameters

  const result = await SubmitProveService.getAllSubmitProve(
    id,
    typeStatus as string
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Submit prove retrieved successfully',
    data: result,
  });
});

const getAllSubmitProveForBrand = catchAsync(
  async (req: Request, res: Response) => {
    // Calling the service method to fetch data for the given brand
    const result = await SubmitProveService.getAllSubmitProveForBrand(
      req.params.id
    );

    // Sending the response back to the client
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Submit prove for brand retrieved successfully',
      data: result,
    });
  }
);

export const SubmitProveController = {
  submitProveToDB,
  getAllSubmitProve,
  getAllSubmitProveForBrand,
};
