import { Types } from 'mongoose';

type IInviteStatus =
  | 'Pending'
  | 'Accepted'
  | 'Rejected'
  | 'Review'
  | 'Completed';

export type IInvite = {
  influencer: Types.ObjectId;
  campaign: Types.ObjectId;
  status: IInviteStatus;
};
