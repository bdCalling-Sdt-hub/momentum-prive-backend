import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { jwtHelper } from '../../../helpers/jwtHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import {
  IAuthResetPassword,
  IChangePassword,
  ILoginData,
  IVerifyEmail,
} from '../../../types/auth';
import cryptoToken from '../../../util/cryptoToken';
import generateOTP from '../../../util/generateOTP';
import { ResetToken } from '../resetToken/resetToken.model';
import { User } from '../user/user.model';
import jwt from 'jsonwebtoken';

const loginUserFromDB = async (payload: ILoginData) => {
  const { password } = payload;

  let isExistUser;
  // Check if the user exists by email or phone number
  if (payload.email) {
    const isExistEmail = await User.findOne({
      email: {
        $eq: payload.email,
        $exists: true,
        $ne: undefined,
      },
      status: 'active',
    }).select('+password');
    isExistUser = isExistEmail;
  } else if (payload.phnNum) {
    const isExistPhone = await User.findOne({
      phnNum: {
        $eq: payload.phnNum,
        $exists: true,
        $ne: undefined,
      },
      status: 'active',
    }).select('+password');
    isExistUser = isExistPhone;
  }

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Check if user is INFLUENCER or BRAND and their loginStatus is 'accept'
  if (
    ['INFLUENCER', 'BRAND'].includes(isExistUser.role) &&
    isExistUser.loginStatus !== 'Approved'
  ) {
    throw new ApiError(
      StatusCodes.NOT_ACCEPTABLE,
      'Your account is not yet approved for login. Please wait for approval.'
    );
  }

  if (
    isExistUser &&
    isExistUser.role === 'INFLUENCER' &&
    !isExistUser.verified
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please verify your account, then try to login again'
    );
  }

  // Check user status
  if (isExistUser && isExistUser.status === 'delete') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You don’t have permission to access this content. It looks like your account has been deactivated.'
    );
  }

  // Check password match
  if (
    password &&
    !(await User.isMatchPassword(password, isExistUser.password))
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect!');
  }

  // Generate access token
  const accessToken = jwtHelper.createToken(
    {
      id: isExistUser._id,
      role: isExistUser.role,
      email: isExistUser.email,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string
  );

  // Generate refresh token
  const refreshToken = jwtHelper.createToken(
    {
      id: isExistUser._id,
      role: isExistUser.role,
      email: isExistUser.email,
    },
    config.jwt.jwt_refresh_secret || ('default_secret' as Secret),
    config.jwt.jwt_refresh_expire_in || ('7d' as string)
  );

  await User.updateOne({ _id: isExistUser._id }, { refreshToken });

  return { accessToken, refreshToken };
};

// const loginUserFromDB = async (payload: ILoginData) => {
//   const { password } = payload;

//   let isExistUser;
//   // Check if the user exists by email or phone number

//   if (payload.email) {
//     const isExistEmail = await User.findOne({
//       email: {
//         $eq: payload.email,
//         $exists: true,
//         $ne: undefined,
//       },
//       status: 'active',
//     }).select('+password');
//     isExistUser = isExistEmail;
//   } else if (payload.phnNum) {
//     const isexistPhone = await User.findOne({
//       phnNum: {
//         $eq: payload.phnNum,
//         $exists: true,
//         $ne: undefined,
//       },
//       status: 'active',
//     }).select('+password');
//     isExistUser = isexistPhone;
//   }

//   if (!isExistUser) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
//   }

//   // Check if user is INFLUENCER or BRAND and their loginStatus is 'accept'
//   if (
//     ['INFLUENCER', 'BRAND'].includes(isExistUser.role) &&
//     isExistUser.loginStatus !== 'Approved'
//   ) {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       'Your account is not yet approved for login. Please wait for approval.'
//     );
//   }

//   if (
//     isExistUser &&
//     isExistUser.role === 'INFLUENCER' &&
//     !isExistUser.verified
//   ) {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       'Please verify your account, then try to login again'
//     );
//   }

//   // Check user status
//   if (isExistUser && isExistUser.status === 'delete') {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       'You don’t have permission to access this content. It looks like your account has been deactivated.'
//     );
//   }

//   // Check password match
//   if (
//     password &&
//     !(await User.isMatchPassword(password, isExistUser.password))
//   ) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect!');
//   }

//   // Create token
//   const createToken = jwtHelper.createToken(
//     {
//       id: isExistUser._id,
//       role: isExistUser.role,
//       email: isExistUser.email,
//       phnNum: isExistUser.phnNum,
//     },
//     config.jwt.jwt_secret as Secret,
//     config.jwt.jwt_expire_in as string
//   );

//   return { createToken };
// };

const forgetPasswordToDB = async (email: string) => {
  const isExistUser = await User.isExistUserByEmail(email);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //send mail
  const otp = generateOTP();
  const value = {
    otp,
    email: isExistUser.email,
  };
  const forgetPassword = emailTemplate.resetPassword(value);
  emailHelper.sendEmail(forgetPassword);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  await User.findOneAndUpdate({ email }, { $set: { authentication } });
};

//verify email
const verifyEmailToDB = async (payload: IVerifyEmail) => {
  const { email, oneTimeCode } = payload;
  const isExistUser = await User.findOne({ email }).select('+authentication');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (!oneTimeCode) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please give the otp, check your email we send a code'
    );
  }

  if (isExistUser.authentication?.oneTimeCode !== oneTimeCode) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You provided wrong otp');
  }

  const date = new Date();
  if (date > isExistUser.authentication?.expireAt) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Otp already expired, Please try again'
    );
  }

  let message;
  let data;

  if (!isExistUser.verified) {
    await User.findOneAndUpdate(
      { _id: isExistUser._id },
      { verified: true, authentication: { oneTimeCode: null, expireAt: null } }
    );
    message =
      'Your email has been successfully verified. Your account is now fully activated.';
  } else {
    await User.findOneAndUpdate(
      { _id: isExistUser._id },
      {
        authentication: {
          isResetPassword: true,
          oneTimeCode: null,
          expireAt: null,
        },
      }
    );

    //create token ;
    const createToken = cryptoToken();
    await ResetToken.create({
      user: isExistUser._id,
      token: createToken,
      expireAt: new Date(Date.now() + 5 * 60000),
    });
    message =
      'Verification Successful: Please securely store and utilize this code for reset password';
    data = createToken;
  }
  return { data, message };
};

//forget password
const resetPasswordToDB = async (
  token: string,
  payload: IAuthResetPassword
) => {
  const { newPassword, confirmPassword } = payload;
  //isExist token
  const isExistToken = await ResetToken.isExistToken(token);
  if (!isExistToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
  }

  //user permission check
  const isExistUser = await User.findById(isExistToken.user).select(
    '+authentication'
  );
  if (!isExistUser?.authentication?.isResetPassword) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "You don't have permission to change the password. Please click again to 'Forgot Password'"
    );
  }

  //validity check
  const isValid = await ResetToken.isExpireToken(token);
  if (!isValid) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Token expired, Please click again to the forget password'
    );
  }

  //check password
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "New password and Confirm password doesn't match!"
    );
  }

  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateData = {
    password: hashPassword,
    authentication: {
      isResetPassword: false,
    },
  };

  await User.findOneAndUpdate({ _id: isExistToken.user }, updateData, {
    new: true,
  });
};

const refreshAccessToken = async (token: string) => {
  const decoded = jwt.verify(
    token,
    config.jwt.jwt_refresh_secret as Secret
  ) as { id: string; iat: number };

  const { id, iat } = decoded;

  // Find user by ID
  const user = await User.isExistUserById(id);

  if (!user || user.status === 'delete' || user.delete) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "User doesn't exist or account is deactivated!"
    );
  }

  // Check if the password has changed after the token was issued
  if (
    user.passwordChangedAt &&
    User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat)
  ) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized!');
  }

  // Generate new access token
  const accessToken = jwtHelper.createToken(
    {
      id: user._id,
      role: user.role,
      email: user.email,
      phnNum: user.phnNum,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string
  );

  return { accessToken };
};

// Invalidate refresh token (for logout)
const invalidateRefreshToken = async (userId: string) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null }, { new: true });
};

const changePasswordToDB = async (
  user: JwtPayload,
  payload: IChangePassword
) => {
  const { currentPassword, newPassword, confirmPassword } = payload;
  const isExistUser = await User.findById(user.id).select('+password');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //current password match
  if (
    currentPassword &&
    !(await User.isMatchPassword(currentPassword, isExistUser.password))
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect');
  }

  //newPassword and current password
  if (currentPassword === newPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please give different password from current password'
    );
  }
  //new password and confirm password check
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Password and Confirm password doesn't matched"
    );
  }

  //hash password
  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateData = {
    password: hashPassword,
  };
  await User.findOneAndUpdate({ _id: user.id }, updateData, { new: true });
};

export const AuthService = {
  verifyEmailToDB,
  loginUserFromDB,
  forgetPasswordToDB,
  resetPasswordToDB,
  changePasswordToDB,
  refreshAccessToken,
};
