import { StatusCodes } from 'http-status-codes';
import { TrackService } from './track.service';
import sendResponse from '../../../shared/sendResponse';
import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';

const getAlllTrackToDB = async (req: Request, res: Response) => {
  const result = await TrackService.getAllTracks(req.params.id, req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Track retrived successfully',
    data: result,
  });
};
const getAllTrackForBrandToDB = async (req: Request, res: Response) => {
  const result = await TrackService.getAllTrackForBrand(
    req.params.userId,
    req.query
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Track retrived for brand successfully',
    data: result,
  });
};

// const getAllTrackForBrandToDB = async (req: Request, res: Response) => {
//   // const result = await TrackService.getAllTrackForBrand(req.params.userId);

//   const { userId } = req.params;
//   const { page = 1, limit = 10 } = req.query; // Get pagination from query parameters

//   // Ensure pagination values are integers
//   const pageNum = parseInt(page as string, 10);
//   const limitNum = parseInt(limit as string, 10);

//   const result = await TrackService.getAllTrackForBrand(
//     userId,
//     pageNum,
//     limitNum
//   );

//   if (result.result.length === 0) {
//     return sendResponse(res, {
//       success: true,
//       statusCode: StatusCodes.OK,
//       message: 'No data found for the requested page',
//       data: result.result,
//       pagination: {
//         page: pageNum,
//         limit: limitNum,
//         total: 0, // Set total to 0 since there are no records
//         totalPage: 0, // Use 'totalPage' instead of 'totalPages'
//       },
//     });
//   }

//   res.status(StatusCodes.OK).json({
//     success: true,
//     statusCode: StatusCodes.OK,
//     message: 'Track retrived successfully',
//     data: result,

//     pagination: {
//       page: pageNum,
//       limit: limitNum,
//       totalCount: result.count,
//       totalPages: Math.ceil(result.count / limitNum),
//     },
//   });
// };

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
