import { Types } from 'mongoose';

export type ITrack = {
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Completed' | 'Cancel';
  campaign: Types.ObjectId;
  brand: Types.ObjectId;
  influencer: Types.ObjectId;
};
