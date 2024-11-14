import { Types } from 'mongoose';

type ICollaborationStatus =
  | 'Pending'
  | 'Accepted'
  | 'Rejected'
  | 'Accomplish'
  | 'Review'
  | 'Completed';

export type ICollaboration = {
  // campaign: Types.ObjectId;
  invite: Types.ObjectId;
  influencer: Types.ObjectId;
  status: 'active' | 'deleted';
  typeStatus: ICollaborationStatus;
  instagram: string;
  user?: Types.ObjectId;
  tiktok?: string;
  categoryName?: string;
  image?: string[];
};
