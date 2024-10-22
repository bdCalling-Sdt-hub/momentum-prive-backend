import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IUser } from '../user/user.interface';
import { User } from '../user/user.model';
import { Brand } from '../brand/brand.model';
import { USER_ROLES } from '../../../enums/user';

const createAdminToDB = async (payload: IUser): Promise<IUser> => {
  payload.role = USER_ROLES.ADMIN;

  const createAdmin: any = await User.create(payload);

  if (!createAdmin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Admin');
  }

  if (createAdmin) {
    // Set verified to true after admin creation
    await User.findByIdAndUpdate(
      { _id: createAdmin._id },
      { verified: true },
      { new: true }
    );
  }

  return createAdmin;
};

const deleteAdminFromDB = async (id: any): Promise<IUser | undefined> => {
  const isExistAdmin = await User.findByIdAndDelete(id);
  if (!isExistAdmin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete Admin');
  }
  return;
};

const getAdminFromDB = async (): Promise<IUser[]> => {
  const admins = await User.find({ role: 'ADMIN' });
  return admins;
};

export const AdminService = {
  createAdminToDB,
  deleteAdminFromDB,
  getAdminFromDB,
};
