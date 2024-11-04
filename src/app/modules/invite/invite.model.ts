import { model, Schema } from 'mongoose';
import { IInvite } from './invite.interface';
import { Invites } from './invite.constant';

const inviteSchema = new Schema<IInvite>(
  {
    influencer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
    // user: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'User',
    // },
  },
  {
    timestamps: true,
  }
);

export const Invite = model<IInvite>('Invite', inviteSchema);
