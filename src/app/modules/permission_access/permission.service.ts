import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { sendEmail } from '../../../helpers/sendMail';
import { IUser } from '../user/user.interface';
import { User } from '../user/user.model';

const getAllBrandUser = async () => {
  const result = await User.find({
    role: 'BRAND',
    status: 'active',
  }).populate('brand');

  return result;
};
const getAllInfluencerUser = async () => {
  const result = await User.find({
    role: 'INFLUENCER',
    status: 'active',
  }).populate('influencer');

  return result;
};

const updatedUserLoginStatus = async (id: string, payload: Partial<IUser>) => {
  const result = await User.findByIdAndUpdate(
    id,
    {
      loginStatus: payload.loginStatus,
      new: true,
      runValidators: true,
    },
    { new: true }
  );

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (result?.email) {
    await sendEmail(
      result.email,
      `Your account has been ${result.loginStatus}`,
      `
          <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
            <p>Dear ${result.fullName},</p>
            <p><strong>Email:</strong> ${result.email}</p>           
             <p>${
               result.loginStatus === 'Approved'
                 ? 'Your information is valid.'
                 : 'Your information is not valid.'
             }</p>           
            <p>${
              result.loginStatus === 'Approved'
                ? 'Thank you for joining us!.'
                : "Sorry you can't join with us."
            }</p>          
          </div>
        `
    );
  } else {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Email is missing');
  }

  return result;
};

export const PermissionService = {
  getAllBrandUser,
  getAllInfluencerUser,
  updatedUserLoginStatus,
};
