import { model, Schema } from 'mongoose';
import { IContact } from './contact.interface';

const contactSchema = new Schema<IContact>(
  {
    details: {
      type: String,
      required: true,
      trim: true,
    },
    image: [
      {
        type: String,
      },
    ],
    whatAppNum: {
      type: Number,
    },
    email: {
      type: String,
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

export const Contact = model<IContact>('Contact', contactSchema);
