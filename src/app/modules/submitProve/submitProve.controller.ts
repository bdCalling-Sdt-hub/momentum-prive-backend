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

const getAllSubmitProve = catchAsync(async (req: Request, res: Response) => {
  const result = await SubmitProveService.getAllSubmitProve(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Submit prove retrieved successfully',
    data: result,
  });
});

export const SubmitProveController = {
  submitProveToDB,
  getAllSubmitProve,
};