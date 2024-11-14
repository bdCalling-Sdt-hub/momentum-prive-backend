import { Types } from 'mongoose';

export type IGender = 'Male' | 'Female' | 'Other' | 'All';

type ITypeStatus = 'Accepted' | 'Rejected' | 'Pending';

export type ICampaign = {
  user: Types.ObjectId;
  influencer?: Types.ObjectId;
  typeStatus?: ITypeStatus;
  image: string;
  name: string;
  startTime: string;
  endTime: string;
  address: string;
  addressLink: string;
  gender: IGender;
  dressCode: string;
  details: string;
  brandInstagram: string;
  collaborationLimit?: number;
  influencerCount?: number;
  approvalStatus: 'Approved' | 'Rejected' | 'Pending';
  rules?: string;
  exchange?: string;
  status: 'active' | 'deleted';
  category?: Types.ObjectId;
  categoryName?: string;
  campaignTermAndCondition: string;
  requiredDocuments?: string[];
};

export type IICampaignFilters = {
  searchTerm?: string;
  categoryName?: string;
  email?: string;
  name?: string;
  details?: string;
  gender?: IGender;
  brandInstagram?: IGender;
  dressCode?: IGender;
  influencer?: string;
  brand?: string;
};
