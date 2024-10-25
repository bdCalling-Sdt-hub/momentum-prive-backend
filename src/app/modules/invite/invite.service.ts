import { IUser } from './../user/user.interface';
import { sendNotifications } from '../../../helpers/notificationHelper';
import QueryBuilder from '../../builder/QueryBuilder';
import { Brand } from '../brand/brand.model';
import { Campaign } from '../campaign/campaign.model';
import { IInfluencer } from '../influencer/influencer.interface';
import { IInvite } from './invite.interface';
import { Invite } from './invite.model';

const createInviteToDB = async (payload: Partial<IInvite>) => {
  const isCampaign = await Campaign.findOne({ _id: payload.campaign }).populate(
    'user',
    'fullName'
  );

  // Check if the campaign exists and if user details are populated
  if (!isCampaign || !isCampaign.user) {
    throw new Error('Campaign or user not found');
  }

  //@ts-ignore
  const fullName = isCampaign.user.fullName;

  const result = await Invite.create(payload);

  const data = {
    text: `${fullName} invited you to join for events`,
    receiver: payload.influencer,
  };
  await sendNotifications(data);

  return result;
};

// const createInviteToDB = async (payloads: Partial<IInvite>[]) => {
//   const results = await Invite.insertMany(payloads);

//   const populatedResults = await Invite.populate(results, {
//     path: 'influencer',
//     select: 'fullName',
//   });

//   const firstInfluencerName = (populatedResults[0].influencer as IInfluencer)
//     .fullName;

//   console.log(results);
//   console.log(firstInfluencerName);

//   if (results) {
//     const data = {
//       text: `${firstInfluencerName} invited you to join for events`,
//       receiver: payloads[0].influencer,
//     };
//     await sendNotifications(data);
//   }

//   return populatedResults;
// };

// const getAllInvites = async (query: Record<string, unknown>) => {
//   const inviteBuilder = new QueryBuilder(
//     Invite.find()
//       .populate({
//         path: 'campaign',
//         populate: {
//           path: 'user',
//         },
//       })
//       .populate('influencer'),
//     query
//   )
//     .search(['campaign', 'influencer'])
//     .filter()
//     .sort()
//     .paginate()
//     .fields();

//   const result = await inviteBuilder.modelQuery;
//   return result;
// };

const getAllInvites = async () => {
  const result = await Invite.find()
    .populate({
      path: 'campaign',
      populate: {
        path: 'user',
        populate: {
          path: 'brand',
        },
      },
    })
    .populate('influencer');
  return result;
};

const updatedInviteToDB = async (id: string, payload: Partial<IInvite>) => {
  const invite = await Invite.findById(id);

  if (!invite) {
    throw new Error(`Invite with ID ${id} not found`);
  }

  const result = await Invite.findByIdAndUpdate(
    id,
    {
      $set: {
        status: payload.status,
      },
    },
    { new: true }
  );

  return result;
};

export const InviteService = {
  createInviteToDB,
  getAllInvites,
  updatedInviteToDB,
};
