import mongoose from 'mongoose';

import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { ISubscriptation } from './subscribation.interface';

const subscriptationSchema = new mongoose.Schema<ISubscriptation>(
  {
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    category: {
      type: String,
      enum: ['Gold', 'Silver', 'Discount'],
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'deleted'],
      default: 'active',
    },
    priceId: {
      // Add priceId to the schema
      type: String,
    },
    option1: {
      type: String,
    },
    option2: {
      type: String,
    },
    option3: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// subscriptationSchema.pre('save', async function (next) {
//   //check user

//   const existingSubscribation = await Subscriptation.findOne({
//     category: this.category,
//   });
//   if (existingSubscribation) {
//     throw new ApiError(StatusCodes.CONFLICT, 'Subscribation already exists');
//   }

//   next();
// });

export const Subscriptation = mongoose.model<ISubscriptation>(
  'Subscriptation',
  subscriptationSchema
);
