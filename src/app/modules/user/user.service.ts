import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import mongoose, { startSession } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';

import { IUser } from './user.interface';
import { User } from './user.model';
import { IBrand } from '../brand/brand.interface';
import { Brand } from '../brand/brand.model';
import { IInfluencer } from '../influencer/influencer.interface';
import { Influencer } from '../influencer/influencer.model';
import QueryBuilder from '../../builder/QueryBuilder';

// const createBrandToDB = async (payload: Partial<IUser & IBrand>) => {
//   const session = await startSession();

//   try {
//     session.startTransaction();

//     // Set role
//     payload.role = USER_ROLES.BRAND;

//     const isNumberExist = await User.findOne({
//       phnNum: {
//         $eq: payload.phnNum,
//         $exists: true,
//         $ne: undefined,
//       },
//     });
//     if (isNumberExist) {
//       throw new ApiError(
//         StatusCodes.BAD_REQUEST,
//         'Phone number already exists'
//       );
//     }

//     const isEmail = await User.findOne({
//       email: {
//         $eq: payload.email,
//         $exists: true,
//         $ne: undefined,
//       },
//     });
//     if (isEmail) {
//       throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exists');
//     }

//     // Validate required fields
//     if (!payload.email) {
//       if (!payload.phnNum) {
//         throw new ApiError(
//           StatusCodes.BAD_REQUEST,
//           'Please provide phone number or email'
//         );
//       }
//     }

//     // Create brand
//     const [brand] = await Brand.create([{ email: payload.email }], { session });
//     if (!brand) {
//       throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create brand');
//     }

//     payload.brand = brand._id;

//     // Create user
//     const [user] = await User.create([payload], { session });
//     if (!user) {
//       throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
//     }

//     // Commit transaction
//     await session.commitTransaction();

//     return user;
//   } catch (error) {
//     // Abort transaction on error
//     await session.abortTransaction();
//     throw error;
//   } finally {
//     // Ensure session ends regardless of success or failure
//     await session.endSession();
//   }
// };

const creatInfluencerToDB = async (payload: Partial<IUser & IInfluencer>) => {
  const session = await startSession();

  try {
    session.startTransaction();

    // Set role
    payload.role = USER_ROLES.INFLUENCER;

    const isEmail = await User.findOne({ email: payload.email });
    if (isEmail) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist');
    }

    // Validate required fields
    if (!payload.email) {
      {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Please provide email');
      }
    }

    // Create brand
    const [influencer] = await Influencer.create([{ email: payload.email }], {
      session,
    });
    if (!influencer) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to create Influencer'
      );
    }

    payload.influencer = influencer._id;

    // Create user
    const [user] = await User.create([payload], { session });
    if (!user) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
    }

    // Generate OTP and prepare email
    const otp = generateOTP();
    const emailValues = {
      name: user.fullName,
      email: user.email,
      otp: otp,
    };
    const accountEmailTemplate = emailTemplate.createAccount(emailValues);
    emailHelper.sendEmail(accountEmailTemplate);

    // Update user with authentication details
    const authentication = {
      oneTimeCode: otp,
      expireAt: new Date(Date.now() + 3 * 60000),
    };
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { $set: { authentication } },
      { session, new: true }
    );

    if (!updatedUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found for update');
    }

    // Commit transaction
    await session.commitTransaction();

    return updatedUser;
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    throw error;
  } finally {
    // Ensure session ends regardless of success or failure
    await session.endSession();
  }
};

const createBrandToDB = async (payload: Partial<IUser & IBrand>) => {
  const session = await startSession();

  try {
    session.startTransaction();

    // Set role
    payload.role = USER_ROLES.BRAND;

    const isEmail = await User.findOne({ email: payload.email });
    if (isEmail) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist');
    }

    // Validate required fields
    if (!payload.email) {
      {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Please provide email');
      }
    }

    // Create brand
    const [brand] = await Brand.create([{ email: payload.email }], {
      session,
    });
    if (!brand) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create brand');
    }

    payload.brand = brand._id;

    // Create user
    const [user] = await User.create([payload], { session });
    if (!user) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
    }

    // Generate OTP and prepare email
    const otp = generateOTP();
    const emailValues = {
      name: user.fullName,
      email: user.email,
      otp: otp,
    };
    const accountEmailTemplate = emailTemplate.createAccount(emailValues);
    emailHelper.sendEmail(accountEmailTemplate);

    // Update user with authentication details
    const authentication = {
      oneTimeCode: otp,
      expireAt: new Date(Date.now() + 3 * 60000),
    };
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { $set: { authentication } },
      { session, new: true }
    );

    if (!updatedUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found for update');
    }

    // Commit transaction
    await session.commitTransaction();

    return updatedUser;
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    throw error;
  } finally {
    // Ensure session ends regardless of success or failure
    await session.endSession();
  }
};

const getUserProfileFromDB = async (
  user: JwtPayload
): Promise<Partial<IUser>> => {
  const { id } = user;

  const isExistUser = await User.findById(id).populate('brand influencer');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "User doesn't exist!");
  }

  return isExistUser;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //unlink file here
  if (payload.image) {
    unlinkFile(isExistUser.image);
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

const getAllBrand = async (query: Record<string, unknown>) => {
  const { searchTerm, page, limit, ...filterData } = query;
  const anyConditions: any[] = [];

  // Add searchTerm condition if present
  if (searchTerm) {
    anyConditions.push({
      $or: [{ fullName: { $regex: searchTerm, $options: 'i' } }],
    });
  }

  // Filter by additional filterData fields
  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.entries(filterData).map(
      ([field, value]) => ({ [field]: value })
    );
    anyConditions.push({ $and: filterConditions });
  }

  // Add 'role: INFLUENCER' to the conditions
  anyConditions.push({
    role: 'BRAND',
  });

  // Combine all conditions
  const whereConditions =
    anyConditions.length > 0 ? { $and: anyConditions } : {};

  // Pagination setup
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  // Fetch influencer data
  const result = await User.find(whereConditions)
    .populate({
      path: 'brand',
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(size)
    .lean();

  const count = await User.countDocuments(whereConditions);

  return {
    result,
    meta: {
      page: pages,
      total: count,
    },
  };
};
const getAllInfluencer = async (query: Record<string, unknown>) => {
  const { searchTerm, page, limit, ...filterData } = query;
  const anyConditions: any[] = [];

  // Check if searchTerm is a number (for searching followers count)
  const followersSearch = !isNaN(Number(searchTerm))
    ? Number(searchTerm)
    : null;

  if (searchTerm) {
    // Search by gender or followers count, based on the type of searchTerm
    const searchConditions = [];
    if (followersSearch !== null) {
      // If searchTerm is a number, search by followers count
      searchConditions.push({ followersIG: followersSearch });
    } else {
      // If searchTerm is a string, search by gender
      searchConditions.push({ gender: { $regex: searchTerm, $options: 'i' } });
      searchConditions.push({
        fullName: { $regex: searchTerm, $options: 'i' },
      });
    }

    // Find Influencers matching gender or followers count
    const matchedInfluencerIds = await Influencer.find({
      $or: searchConditions,
    }).distinct('_id');

    if (matchedInfluencerIds.length > 0) {
      const userIds = await User.find({
        influencer: { $in: matchedInfluencerIds },
        role: 'INFLUENCER',
      }).distinct('_id');

      if (userIds.length > 0) {
        anyConditions.push({ _id: { $in: userIds } });
      }
    }
  }

  // Fallback to search by fullName if no matches for gender or followers count
  if (searchTerm && anyConditions.length === 0) {
    anyConditions.push({
      fullName: { $regex: searchTerm, $options: 'i' },
      role: 'INFLUENCER',
    });
  }

  // Apply additional filters
  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.entries(filterData).map(
      ([field, value]) => ({ [field]: value })
    );
    anyConditions.push({ $and: filterConditions });
  }

  // Ensure only influencers are fetched
  anyConditions.push({ role: 'INFLUENCER' });

  // Combine all conditions
  const whereConditions =
    anyConditions.length > 0 ? { $and: anyConditions } : {};

  // Pagination setup
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  // Fetch influencer data
  const result = await User.find(whereConditions)
    .populate({
      path: 'influencer',
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(size)
    .lean();

  const count = await User.countDocuments(whereConditions);

  return {
    result,
    meta: {
      page: pages,
      total: count,
    },
  };
};

const getSingleInflueencer = async (id: string) => {
  const result = await User.findById(id).populate('influencer');
  return result;
};

const updateProfile = async (id: string, payload: Partial<IUser>) => {
  const update = await User.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return update;
};

export const UserService = {
  createBrandToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  updateProfile,
  creatInfluencerToDB,
  getAllBrand,
  getAllInfluencer,
  getSingleInflueencer,
};
