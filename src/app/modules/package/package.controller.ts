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
  const result = await PackageService.getAllPackage(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Package retirived successfully',
    data: result,
  });
});

const updatePackage = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await PackageService.updatePackage(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Package updated successfully',
    data: result,
  });
});

export const PackageController = {
  createPackage,
  getAllPackage,
  updatePackage,
};
