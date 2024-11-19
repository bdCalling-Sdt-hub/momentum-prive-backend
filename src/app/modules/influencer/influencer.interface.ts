import { Model, Types } from 'mongoose';

export type IGender = 'Male' | 'Female' | 'Other' | 'All';

export type IInfluencer = {
  image: string[];
  instagram: string;
  tiktok?: string;
  followersIG: number;
  followersTK: number;
  describe: string;
  email: string;
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
  imagesToDelete?: string[];
};

export type InfluencerModel = Model<IInfluencer>;
