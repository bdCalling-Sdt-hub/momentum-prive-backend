import { model, Schema } from 'mongoose';
import { IInvite } from './invite.interface';
import { Invites } from './invite.constant';

const inviteSchema = new Schema<IInvite>(
  {
    influencer: {
      type: Schema.Types.ObjectId,
      ref: 'Influencer',
      required: true,
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
  },
  {
    timestamps: true,
  }
);

export const Invite = model<IInvite>('Invite', inviteSchema);
