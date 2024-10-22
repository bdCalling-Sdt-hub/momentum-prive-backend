import { model, Schema } from 'mongoose';
import { ICollaboration } from './collaboration.interface';
import { inviteStatus } from './collaboration.constant';

const collaborateSchema = new Schema<ICollaboration>(
  {
    campaign: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
    },
    influencer: {
      type: Schema.Types.ObjectId,
      ref: 'Influencer',
    },
    image: {
      type: [String],
    },
    instagram: {
      type: String,
    },
    tiktok: {
      type: String,
    },
    categoryName: {
      type: String,
    },
    typeStatus: {
      type: String,
      enum: inviteStatus,
      default: 'Pending',
    },
    status: {
      type: String,
      enum: ['active', 'deleted'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

collaborateSchema.pre('save', function (next) {
  if (this.typeStatus === 'Pending') {
    this.typeStatus = 'Review';
  }
  next();
});

export const Collaborate = model<ICollaboration>(
  'Collaboration',
  collaborateSchema
);
