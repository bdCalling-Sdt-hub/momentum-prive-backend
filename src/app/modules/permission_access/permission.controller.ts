import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { PermissionService } from './permission.service';

const getAllBrandUser = catchAsync(async (req: Request, res: Response) => {
  const result = await PermissionService.getAllBrandUser();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Brand User Retrieved Successfully',
    data: result,
  });
});

const getAllInfluencerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await PermissionService.getAllInfluencerUser();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Influencer User Retrieved Successfully',
    data: result,
  });
});

const updatedUserLoginStatus = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PermissionService.updatedUserLoginStatus(
      req.params.id,
      req.body
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'User Login Status Updated Successfully',
      data: result,
    });
  }
);

export const PermissionController = {
  getAllBrandUser,
  getAllInfluencerUser,
  updatedUserLoginStatus,
};
