import { model, Schema } from 'mongoose';
import {
  ITermsAndConditionApp,
  ITermsAndConditionBrand,
  ITermsAndConditionInfluencer,
} from './termsAndCondition.interface';

const termAndConditionSchemaBrand = new Schema<ITermsAndConditionBrand>(
  {
    details: {
      type: String,
      required: true,
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

export const TermsAndConditionBrand = model<ITermsAndConditionBrand>(
  'TermsAndConditionBrand',
  termAndConditionSchemaBrand
);

const termAndConditionSchemaInfluencer =
  new Schema<ITermsAndConditionInfluencer>(
    {
      details: {
        type: String,
        required: true,
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

export const TermsAndConditionInfluencer = model<ITermsAndConditionInfluencer>(
  'TermsAndConditionInfluencer',
  termAndConditionSchemaInfluencer
);

const termAndConditionSchemaApp = new Schema<ITermsAndConditionApp>(
  {
    details: {
      type: String,
      required: true,
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

export const TermsAndConditionApp = model<ITermsAndConditionApp>(
  'TermsAndConditionApp',
  termAndConditionSchemaApp
);
