import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CategoryService } from './category.service';
import { Request, Response } from 'express';
import e from 'cors';
import getFilePath from '../../../shared/getFilePath';

const createCategoryToDB = catchAsync(async (req: Request, res: Response) => {
  let image = getFilePath(req.files, 'images');

  const value = {
    image,
    ...req.body,
  };

  const result = await CategoryService.createCategiryToDB(value);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Category created successfully',
    data: result,
  });
});

const getAllCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getAllCategory(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Category retrived successfully',
    data: result,
  });
});

const getSingleCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getSingleCategory(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Single Category retrived successfully',
    data: result,
  });
});

const updateCategoryToDB = catchAsync(async (req: Request, res: Response) => {
  const categoryId = req.params.id;

  let image;
  if (req.files && 'image' in req.files && req.files.image[0]) {
    image = `/images/${req.files.image[0].filename}`;
  }

  const value = {
    image,
    ...req.body,
  };

  const result = await CategoryService.updateCategoryToDB(categoryId, value);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Category updated successfully',
    data: result,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const categoryId = req.params.id;
  const result = await CategoryService.deleteCategoryToDB(categoryId);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Category deleted successfully',
    data: result,
  });
});

export const CategoryController = {
  createCategoryToDB,
  getAllCategory,
  getSingleCategory,
  updateCategoryToDB,
  deleteCategory,
};
