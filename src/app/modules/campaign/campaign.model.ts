import { model, Schema } from 'mongoose';
import { ICampaign } from './campaign.interface';
import { Gender } from './campaign.contant';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';

const campaignSchema = new Schema<ICampaign>(
  {
    image: {
      type: String,
      default:
        'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
      required: true,
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
    },
    influencer: {
      type: Schema.Types.ObjectId,
      ref: 'Influencer',
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
    collaboration: {
      type: Number,
      required: true,
    },
    rules: {
      type: String,
      trim: true,
    },
    exchange: {
      type: String,
      trim: true,
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

campaignSchema.pre('save', async function (next) {
  //check user

  const existingCampaign = await Campaign.findOne({ name: this.name });
  if (existingCampaign) {
    throw new ApiError(StatusCodes.CONFLICT, 'Campaign already exists');
  }

  next();
});

export const Campaign = model<ICampaign>('Campaign', campaignSchema);
