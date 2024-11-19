import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { BrandService } from './brand.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import getFilePath from '../../../shared/getFilePath';
import { IBrand } from './brand.interface';

const updatedBrand = catchAsync(async (req: Request, res: Response) => {
  const userEmail = req.user?.email;

  let image;
  if (req.files && 'image' in req.files && req.files.image[0]) {
    image = `/images/${req.files.image[0].filename}`;
  }

  const value: Partial<IBrand> = {
    image,
    ...req.body,
  };

  const result = await BrandService.updateBrandToDB(userEmail, value);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Brand updated successfully',
    data: result,
  });
});

const getAllBrands = catchAsync(async (req: Request, res: Response) => {
  const { country, city } = req.query;

  const result = await BrandService.getAllBrands(
    country as string | undefined,
    city as string | undefined
  );

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
