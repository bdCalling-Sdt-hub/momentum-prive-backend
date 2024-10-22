import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CategoryService } from './category.service';
import { Request, Response } from 'express';
import e from 'cors';

const createCategoryToDB = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.createCategiryToDB(req.body);
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
  const categoryData = req.body;
  const result = await CategoryService.updateCategoryToDB(
    categoryId,
    categoryData
  );
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
