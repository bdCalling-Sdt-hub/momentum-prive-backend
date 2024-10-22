import { Types } from 'mongoose';

export type IGender = 'male' | 'female' | 'other';

type ITypeStatus = 'Accepted' | 'Rejected' | 'Pending';

export type ICampaign = {
  brand: Types.ObjectId;
  influencer?: Types.ObjectId;
  typeStatus?: ITypeStatus;
  image: string;
  name: string;
  startTime: string;
  endTime: string;
  address: string;
  gender: IGender;
  dressCode: string;
  details: string;
  brandInstagram: string;
  collaboration: number;
  rules?: string;
  exchange?: string;
  status: 'active' | 'deleted';
  category?: Types.ObjectId;
  categoryName?: string;
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
