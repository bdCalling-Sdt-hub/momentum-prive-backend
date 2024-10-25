import { Types } from 'mongoose';

export type IReview = {
  user: Types.ObjectId;
  influencer: Types.ObjectId;
  details: string;
  rating?: number;
  status: 'active' | 'delete';
};
