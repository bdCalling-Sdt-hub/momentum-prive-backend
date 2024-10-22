import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { RequirementService } from './requirement.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createRequirementToDB = catchAsync(
  async (req: Request, res: Response) => {
    const result = await RequirementService.createRequirementToDB(req.body);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Requiement created successfully',
      data: result,
    });
  }
);

export const RequirementController = {
  createRequirementToDB,
};
