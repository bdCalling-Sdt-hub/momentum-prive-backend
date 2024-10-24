import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PackageService } from './package.service';
import { query, Request, Response } from 'express';

const createPackage = catchAsync(async (req, res, next) => {
  const result = await PackageService.createPackage(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Package created successfully',
    data: result,
  });
});

const getAllPackage = catchAsync(async (req: Request, res: Response) => {
  const filter = req.body;
  const result = await PackageService.getAllPackage(filter);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Package retirived successfully',
    data: result,
  });
});

export const PackageController = {
  createPackage,
  getAllPackage,
};
