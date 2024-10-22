import { Model } from 'mongoose';

export type IGender = 'male' | 'female' | 'other';

export type IInfluencer = {
  image: string[];
  instagram: string;
  tiktok?: string;
  followersIG: number;
  followersTK: number;
  describe: string;
  gender: IGender;
  number: string;
  whatAppNum: string;
  address: string;
  country: string;
  city: string;
  zip?: number;
  status: 'active' | 'delete';
};

export type InfluencerModel = {} & Model<IInfluencer>;
