import { Types } from 'mongoose';

type IInterestStatusInfo = 'Pending' | 'Accepted' | 'Rejected';

export type IInterestInfo = {
  campaign: Types.ObjectId;
  influencer: Types.ObjectId;
  submitProve: Types.ObjectId;
  status: IInterestStatusInfo;
};
