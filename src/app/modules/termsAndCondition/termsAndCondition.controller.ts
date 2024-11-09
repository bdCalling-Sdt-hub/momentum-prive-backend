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
    message: 'Term-and -condition created brand successfully',
    data: result,
  });
});

const getAllTerms = catchAsync(async (req: Request, res: Response) => {
  try {
    const result = await TermsAndConditionService.getTermsFromDB();

    res.status(200).json({
      StatusCodes: StatusCodes.OK,
      success: true,
      message: 'Terms and conditions retrieved successfully',
      data: result, // Return the result array directly
    });
  } catch (error) {
    res.status(500).json({
      StatusCodes: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      message: 'Failed to retrieve terms and conditions',
    });
  }
});

// info: update terms and condition

const createTermAndConditionInfluencers = catchAsync(
  async (req: Request, res: Response) => {
    const result = await TermsAndConditionService.createTermsToDBInfluencer(
      req.body
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Term-and-condition created influencer successfully',
      data: result,
    });
  }
);

const getTermAndConditionInfluencers = catchAsync(
  async (req: Request, res: Response) => {
    const result = await TermsAndConditionService.getTermsFromDBInfluencer();
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Term-and-condition retrieved influencer successfully',
      data: result,
    });
  }
);

//app

const createTermAndConditionApp = catchAsync(
  async (req: Request, res: Response) => {
    const result = await TermsAndConditionService.createTermsToDBApp(req.body);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Term-and-condition created app successfully',
      data: result,
    });
  }
);

const getTermAndConditionApp = catchAsync(
  async (req: Request, res: Response) => {
    const result = await TermsAndConditionService.getTermsFromDBApp();
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Term-and-condition retrieved App successfully',
      data: result,
    });
  }
);

export const TermsAndConditionController = {
  createCategoryToDB,
  getAllTerms,
  createTermAndConditionInfluencers,
  getTermAndConditionInfluencers,
  createTermAndConditionApp,
  getTermAndConditionApp,
};
