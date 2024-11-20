import { model, Schema } from 'mongoose';
import { IInfluencer } from './influencer.interface';
import { Gender } from './influencer.constant';

const influencerShema = new Schema<IInfluencer>(
  {
    address: {
      type: String,
    },
    image: {
      type: [String],
    },
    whatAppNum: {
      type: String,
    },
    contactEmail: {
      type: String,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
    zip: {
      type: String,
    },

    describe: {
      type: String,
    },
    email: {
      type: String,
    },
    followersIG: {
      type: Number,
    },

    followersTK: {
      type: Number,
    },
    gender: {
      type: String,
      enum: Gender,
    },
    number: {
      type: String,
    },
    instagram: {
      type: String,
    },
    tiktok: {
      type: String,
    },
    count: {
      type: String,
    },
    rating: {
      type: Number,
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

export const Influencer = model<IInfluencer>('Influencer', influencerShema);
