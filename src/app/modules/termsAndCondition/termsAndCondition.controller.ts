import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { TermsAndConditionService } from './termsAndCondition.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createCategoryToDB = catchAsync(async (req: Request, res: Response) => {
  const result = await TermsAndConditionService.createTermsToDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Term and condition created successfully',
    data: result,
  });
});

const getAllTerms = catchAsync(async (req: Request, res: Response) => {
  const result = await TermsAndConditionService.getTermsFromDB();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Term and condition retrived successfully',
    data: result,
  });
});

export const TermsAndConditionController = {
  createCategoryToDB,
  getAllTerms,
};
