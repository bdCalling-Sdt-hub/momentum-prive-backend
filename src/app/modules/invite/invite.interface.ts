import { Types } from 'mongoose';
import { IInfluencer } from '../influencer/influencer.interface';

type IInviteStatus =
  | 'Pending'
  | 'Accepted'
  | 'Rejected'
  | 'Review'
  | 'Completed'
  | 'Accomplish';

export type IInvite = {
  influencer: Types.ObjectId;
  campaign: Types.ObjectId;
  status: IInviteStatus;
};
