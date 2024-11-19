import { model, Schema } from 'mongoose';
import { ICampaign } from './campaign.interface';
import { Gender } from './campaign.contant';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';

const campaignSchema = new Schema<ICampaign>(
  {
    image: {
      type: String,
    },
    addressLink: {
      type: String,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    influencer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    category: {
      type: String,
      ref: 'Category',
    },
    categoryName: {
      type: String,
    },
    typeStatus: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected'],
    },
    details: {
      type: String,
      required: true,
      trim: true,
    },
    influencerCount: {
      type: Number,
      default: 0,
    },
    requiredDocuments: [
      {
        type: String,
      },
    ],
    name: {
      type: String,
      required: true,
      trim: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: Gender,
      required: true,
    },
    dressCode: {
      type: String,
      required: true,
      trim: true,
    },
    brandInstagram: {
      type: String,
      required: true,
      trim: true,
    },
    collaborationLimit: {
      type: Number,
    },
    rules: {
      type: String,
      trim: true,
    },
    exchange: {
      type: String,
      trim: true,
    },
    approvalStatus: {
      type: String,
      enum: ['Approved', 'Rejected', 'Pending'],
      default: 'Pending',
    },
    campaignTermAndCondition: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'delete'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// campaignSchema.pre('save', async function (next) {
//   //check user

//   const existingCampaign = await Campaign.findOne({ name: this.name });
//   if (existingCampaign) {
//     throw new ApiError(StatusCodes.UNAUTHORIZED, 'Campaign already exists');
//   }

//   next();
// });

export const Campaign = model<ICampaign>('Campaign', campaignSchema);
