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
    message: 'Invite send successfully',
    data: result,
  });
});

const inviteForSpasificInfluencer = catchAsync(
  async (req: Request, res: Response) => {
    const result = await InviteService.inviteForSpasificInfluencer(req.body);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Invite send for specific influencer successfully',
      data: result,
    });
  }
);

const createInviteForInfluencerToDB = catchAsync(
  async (req: Request, res: Response) => {
    const result = await InviteService.createInviteForIncluencerToDB(req.body);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Invite send successfully',
      data: result,
    });
  }
);

const getAllInvites = catchAsync(async (req: Request, res: Response) => {
  const result = await InviteService.getAllInvites(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Invite retrived successfully',
    data: result,
  });
});

const getAllInvitesForInfluencer = catchAsync(
  async (req: Request, res: Response) => {
    const { influencerId } = req.params; // Extract userId from URL params
    const query = { ...req.query, influencerId }; // Merge userId into query object

    const result = await InviteService.getAllInvitesForInfluencer(query);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Invite retrived successfully',
      data: result,
    });
  }
);

const updatedInviteToDB = catchAsync(async (req: Request, res: Response) => {
  const result = await InviteService.updatedInviteToDB(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Invite status updated successfully',
    data: result,
  });
});

const getSingleInvite = catchAsync(async (req: Request, res: Response) => {
  const result = await InviteService.getSingleInvite(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Singgle Invite retived successfully',
    data: result,
  });
});

export const InviteController = {
  createCategoryToDB,
  getAllInvites,
  updatedInviteToDB,
  getSingleInvite,
  getAllInvitesForInfluencer,
  inviteForSpasificInfluencer,
};
