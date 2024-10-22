import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { InviteService } from './invite.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createCategoryToDB = catchAsync(async (req: Request, res: Response) => {
  const result = await InviteService.createInviteToDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Invite created successfully',
    data: result,
  });
});

const getAllInvites = catchAsync(async (req: Request, res: Response) => {
  const result = await InviteService.getAllInvites(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Invite retrived successfully',
    data: result,
  });
});

const updatedInviteToDB = catchAsync(async (req: Request, res: Response) => {
  const result = await InviteService.updatedInviteToDB(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Invite status updated successfully',
    data: result,
  });
});

export const InviteController = {
  createCategoryToDB,
  getAllInvites,
  updatedInviteToDB,
};
