import { StatusCodes } from 'http-status-codes';
import { TrackService } from './track.service';
import sendResponse from '../../../shared/sendResponse';
import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';

const getAlllTrackToDB = async (req: Request, res: Response) => {
  const result = await TrackService.getAllTracks(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Track retrived successfully',
    data: result,
  });
};

const getAllTrackForBrandToDB = async (req: Request, res: Response) => {
  const result = await TrackService.getAllTrackForBrand(req.params.userId);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Track for brand retrived successfully',
    data: result,
  });
};

const updateTrackStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await TrackService.updateTrackStatus(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Track updated successfully',
    data: result,
  });
});

export const TrackController = {
  getAlllTrackToDB,
  updateTrackStatus,
  getAllTrackForBrandToDB,
};
