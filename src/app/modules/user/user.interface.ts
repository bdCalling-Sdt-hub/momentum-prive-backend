import { Model, Types } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';

export type IUser = {
  role: USER_ROLES;
  fullName: string;
  email?: string;
  referralCode?: string;
  password: string;
  status: 'active' | 'delete';
  loginStatus: 'Approved' | 'Rejected' | 'Pending';
  verified?: boolean;
  image?: string;
  brand?: Types.ObjectId;
  influencer?: Types.ObjectId;
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isExistUserByPhnNum(phnNum: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number
  ): boolean;
} & Model<IUser>;
