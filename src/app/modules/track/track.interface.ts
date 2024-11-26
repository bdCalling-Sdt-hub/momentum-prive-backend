import { Types } from 'mongoose';

export type ITrack = {
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Completed' | 'Cancel';
  campaign: Types.ObjectId;
  completeStatus: 'Completed' | 'NotCompleted';
  brand: Types.ObjectId;
  influencer: Types.ObjectId;
};
