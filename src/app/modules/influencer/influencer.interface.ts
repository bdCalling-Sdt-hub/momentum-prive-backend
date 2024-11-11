import { Model, Types } from 'mongoose';

export type IGender = 'male' | 'female' | 'other';

export type IInfluencer = {
  image: string[];
  instagram: string;
  tiktok?: string;
  followersIG: string;
  followersTK: string;
  describe: string;
  gender: IGender;
  number: string;
  whatAppNum: string;
  address: string;
  country: string;
  city: string;
  zip?: string;
  status: 'active' | 'delete';
};

export type UpdateInfluencerPayload = Partial<IInfluencer> & {
  imagesToDelete?: string[]; // Optional field for images to delete
};

export type InfluencerModel = Model<IInfluencer>;
