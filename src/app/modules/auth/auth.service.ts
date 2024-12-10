import { Influencer } from './../influencer/influencer.model';
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
import { Brand } from '../brand/brand.model';

const loginUserFromDB = async (payload: ILoginData) => {
  const { password } = payload;

  let isExistUser;
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
    throw new ApiError(StatusCodes.UNAUTHORIZED, "User doesn't exist!");
  }

  const isInfluencer = await Influencer.findById(isExistUser?.influencer);
  const isBrand = await Brand.findById(isExistUser?.brand);

  // Generate 10-minute token for `otherName`
  const tokens = jwtHelper.createToken(
    {
      id: isExistUser._id,
      role: isExistUser.role,
      email: isExistUser.email,
    },
    config.jwt.jwt_secret as Secret,
    '120m'
  );

  // Validate Influencer or Brand data
  if (isExistUser.role === 'INFLUENCER' && isInfluencer) {
    if (
      !isInfluencer.image.length ||
      !isInfluencer.instagram ||
      !isInfluencer.followersIG ||
      !isInfluencer.describe ||
      !isInfluencer.gender ||
      !isInfluencer.whatAppNum ||
      !isInfluencer.address ||
      !isInfluencer.country ||
      !isInfluencer.city
    ) {
      throw new ApiError(
        407,
        'Incomplete influencer information. Please update your profile.',
        { tokens, role: isExistUser?.role }
      );
    }
  }

  if (isExistUser.role === 'BRAND' && isBrand) {
    if (
      !isBrand.image ||
      !isBrand.whatAppNum ||
      !isBrand.owner ||
      !isBrand.country ||
      !isBrand.city ||
      !isBrand.address ||
      !isBrand.code ||
      !isBrand.category ||
      !isBrand.manager ||
      !isBrand.instagram
    ) {
      throw new ApiError(
        407,
        'Incomplete brand information. Please update your profile.',
        { tokens, role: isExistUser?.role }
      );
    }
  }

  if (['INFLUENCER', 'BRAND'].includes(isExistUser.role)) {
    if (isExistUser.loginStatus === 'Rejected') {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        'Your account is rejected for approval. You cannot login.'
      );
    } else if (isExistUser.loginStatus !== 'Approved') {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        'Your account is not yet approved for login. Please wait for approval.'
      );
    }
  }

  if (
    (isExistUser.role === 'INFLUENCER' && !isExistUser.verified) ||
    (isExistUser.role === 'BRAND' && !isExistUser.verified)
  ) {
    throw new ApiError(
      StatusCodes.NOT_ACCEPTABLE,
      'Please verify your account, then try to login again'
    );
  }

  if (isExistUser && isExistUser.status === 'delete') {
    throw new ApiError(
      StatusCodes.NOT_ACCEPTABLE,
      'You don’t have permission to access this content. It looks like your account has been deactivated.'
    );
  }

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

  return { accessToken, refreshToken, tokens, role: isExistUser?.role };
};

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

  // generate token

  const tokens = jwtHelper.createToken(
    { email: isExistUser.email, id: isExistUser._id, role: isExistUser.role },
    config.jwt.jwt_secret as Secret,
    '120m'
  );

  console.log(tokens);
  return { data, message, tokens };
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
