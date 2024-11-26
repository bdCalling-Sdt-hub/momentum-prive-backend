import { Types } from 'mongoose';
import { IInfluencer } from '../influencer/influencer.interface';

type IInviteStatus =
  | 'Pending'
  | 'Accepted'
  | 'Rejected'
  | 'Cancel'
  | 'Review'
  | 'Completed'
  | 'Accomplish';

export type IInvite = {
  influencer?: Types.ObjectId;
  campaign: Types.ObjectId;
  status: IInviteStatus;
  // user: Types.ObjectId;
  completeStatus: 'Completed' | 'NotCompleted';
  gender: string;
  country: string;
  city: string;
};
