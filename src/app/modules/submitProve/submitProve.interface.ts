import { Types } from 'mongoose';

type ISubmitStatus =
  | 'Pending'
  | 'Accepted'
  | 'Rejected'
  | 'Accomplish'
  | 'Review'
  | 'Completed';

export type ISubmitProve = {
  // campaign: Types.ObjectId;
  //   invite: Types.ObjectId;
  // influencer: Types.ObjectId;
  track: Types.ObjectId;
  status: 'active' | 'deleted';
  typeStatus: ISubmitStatus;
  instagram: string;
  user: Types.ObjectId;
  tiktok?: string;
  categoryName?: string;
  image?: string[];
};
