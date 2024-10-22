import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { BrandService } from './brand.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import getFilePath from '../../../shared/getFilePath';

const updatedBrand = catchAsync(async (req: Request, res: Response) => {
  const brandId = req.params.id;

  let image = getFilePath(req.files, 'images');

  const value = {
    image,
    ...req.body,
  };

  const result = await BrandService.updateBrandToDB(brandId, value);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Brand updated successfully',
    data: result,
  });
});

const getAllBrands = catchAsync(async (req: Request, res: Response) => {
  const filter = req.body;

  const result = await BrandService.getAllBrands(req.query, filter);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Brand fetched successfully',
    data: result,
  });
});

export const BrandController = {
  updatedBrand,
  getAllBrands,
};
