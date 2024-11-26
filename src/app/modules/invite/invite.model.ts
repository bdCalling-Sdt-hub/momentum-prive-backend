import { model, Schema } from 'mongoose';
import { IInvite } from './invite.interface';
import { Invites } from './invite.constant';

const inviteSchema = new Schema<IInvite>(
  {
    influencer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    campaign: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    status: {
      type: String,
      enum: Invites,
      default: 'Pending',
    },
    gender: {
      type: String,
    },
    country: {
      type: String,
    },
    city: {
      type: String,
    },
    completeStatus: {
      type: String,
      enum: ['Completed', 'NotCompleted'],
    },
  },
  {
    timestamps: true,
  }
);

export const Invite = model<IInvite>('Invite', inviteSchema);
