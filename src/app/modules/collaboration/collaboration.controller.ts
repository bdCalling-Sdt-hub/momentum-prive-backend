import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { CollaborationService } from './collaboration.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getFilePaths } from '../../../shared/getFilePath';

const createCollaborationToDB = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;

    let images = getFilePaths(req.files, 'images');

    const value = {
      image: images,
      ...payload,
    };
    const result = await CollaborationService.createCollaborationToDB(value);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Collaboration created successfully',
      data: result,
    });
  }
);

const getAllCollaborations = catchAsync(async (req: Request, res: Response) => {
  const filter = req.body;
  const result = await CollaborationService.getAllCollaborations(
    req.query,
    filter
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Collaboration retirived successfully',
    data: result,
  });
});

const getAllCollaborationForInfluencer = catchAsync(
  async (req: Request, res: Response) => {
    const { id: influencerId } = req.params;
    const { typeStatus } = req.query; // Extract typeStatus from the query

    const result = await CollaborationService.getAllCollaborationForInfluencer(
      influencerId,
      typeStatus as string
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Collaboration for influencer retrieved successfully',
      data: result,
    });
  }
);

const updatedCollaborationToDB = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CollaborationService.updatedCollaborationToDB(
      req.params.id,
      req.body
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Collaboration status updated successfully',
      data: result,
    });
  }
);

export const CollaborationController = {
  createCollaborationToDB,
  getAllCollaborations,
  updatedCollaborationToDB,
  getAllCollaborationForInfluencer,
};
