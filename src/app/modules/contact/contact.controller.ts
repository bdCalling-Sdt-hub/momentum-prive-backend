import { NextFunction, Request, Response } from 'express';
import { ContactService } from './contact.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getFilePaths } from '../../../shared/getFilePath';
import catchAsync from '../../../shared/catchAsync';

const createContactToDB = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let image = getFilePaths(req.files, 'images');

    const value = {
      image,
      ...req.body,
    };

    const result = await ContactService.createContactToDB(value);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Contact created successfully',
      data: result,
    });
  } catch (error) {
    next(error); // Pass the error to the next middleware (error handler)
  }
};

const getAllContacts = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactService.getContactFromDB();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Contacts retrieved successfully',
    data: result,
  });
});

export const ContactController = {
  createContactToDB,
  getAllContacts,
};
