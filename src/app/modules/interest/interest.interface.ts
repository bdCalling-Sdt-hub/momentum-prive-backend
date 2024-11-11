import { Types } from 'mongoose';

type IInterestStatusInfo = 'Pending' | 'Accepted' | 'Rejected' | 'Completed';

export type IInterestInfo = {
  campaign: Types.ObjectId;
  influencer: Types.ObjectId;
  submitProve: Types.ObjectId;
  track: Types.ObjectId;
  status: IInterestStatusInfo;
};
