import { Types } from 'mongoose';

export type ITrack = {
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Completed';
  campaign: Types.ObjectId;
  influencer: Types.ObjectId;
};
