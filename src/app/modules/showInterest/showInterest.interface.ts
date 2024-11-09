import { Types } from 'mongoose';

type IShowInterestStatus =
  | 'Pending'
  | 'Accepted'
  | 'Rejected'
  | 'Review'
  | 'Completed'
  | 'Accomplish';

export type IShowInterest = {
  influencer: Types.ObjectId;
  campaign: Types.ObjectId;
  status: IShowInterestStatus;
};
