import { Types } from 'mongoose';

type IInterestStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Completed';

export type IInterest = {
  campaign: Types.ObjectId;
  influencer: Types.ObjectId;
  collaborate: Types.ObjectId;
  status: IInterestStatus;
};
