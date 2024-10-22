import { Types } from 'mongoose';

export type IReview = {
  brand: Types.ObjectId;
  influencer: Types.ObjectId;
  details: string;
  rating?: number;
  status: 'active' | 'delete';
};
