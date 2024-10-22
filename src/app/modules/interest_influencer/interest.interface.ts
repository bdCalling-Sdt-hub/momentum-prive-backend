import { Types } from 'mongoose';

type IInterestStatus = 'Pending' | 'Accepted' | 'Rejected';

export type IInterest = {
  campaign: Types.ObjectId;
  influencer: Types.ObjectId;
  Collaborate: Types.ObjectId;
  status: IInterestStatus;
};
