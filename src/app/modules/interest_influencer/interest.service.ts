import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Collaborate } from '../collaboration/collaboration.model';
import { IInterest } from './interest.interface';
import { Interest } from './interest.model';
import { User } from '../user/user.model';
import { sendNotifications } from '../../../helpers/notificationHelper';

const getAllInterest = async () => {
  const result = await Interest.find()
    .populate({
      path: 'campaign',
      populate: {
        path: 'user',
        populate: {
          path: 'brand',
        },
      },
    })
    .populate({
      path: 'influencer',
      populate: {
        path: 'influencer',
      },
    });
  return result;
};

// const updatedInterestStautsToDb = async (
//   id: string,
//   payload: Partial<IInterest>
// ) => {
//   const updatedStatus = await Interest.findByIdAndUpdate(
//     id,
//     {
//       $set: {
//         status: payload.status,
//       },
//     },
//     {
//       new: true,
//       runValidators: true,
//     }
//   );

//   if (!updatedStatus) {
//     throw new Error('Interest not found');
//   }

//   const collaborationId = updatedStatus.Collaborate;
//   if (updatedStatus.status === 'Accepted') {
//     const updateCollaboration = await Collaborate.findOneAndUpdate(
//       {
//         _id: collaborationId, // Filter using the Collaborate ID
//       },
//       {
//         $set: {
//           status: 'Completed',
//         },
//       },
//       {
//         new: true,
//         runValidators: true,
//       }
//     );
//     console.log(updateCollaboration);
//     return updateCollaboration;
//   } else if (updatedStatus.status === 'Rejected') {
//     const update = await Collaborate.findOneAndUpdate(
//       {
//         _id: collaborationId, // Filter using the Collaborate ID
//       },
//       {
//         $set: {
//           status: 'Rejected',
//         },
//       },
//       {
//         new: true,
//         runValidators: true,
//       }
//     );
//     console.log(update);
//     return update;
//   }
// };

const updatedInterestStautsToDb = async (
  id: string,
  payload: Partial<IInterest>
) => {
  const acceptedCount = await Interest.countDocuments({ status: 'Accepted' });

  // Limit to only 4 "Accepted" statuses
  if (payload.status === 'Accepted' && acceptedCount >= 4) {
    throw new Error('Cannot accept more than 4 statuses');
  }

  const updatedStatus = await Interest.findByIdAndUpdate(
    id,
    {
      $set: {
        status: payload.status,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedStatus) {
    throw new Error('Interest not found');
  }

  const collaborationId = updatedStatus.Collaborate;

  // send notifications
  const influencerId = updatedStatus.influencer;

  const influencerData = await User.findById(influencerId);

  if (updatedStatus.status === 'Accepted') {
    const data = {
      text: `${influencerData?.fullName} Accept your interest`,
      receiver: payload.influencer,
    };
    await sendNotifications(data);
  } else {
    updatedStatus.status === 'Rejected';
    const data = {
      text: `${influencerData?.fullName} Reject your interest`,
      receiver: payload.influencer,
    };
    await sendNotifications(data);
  }
  // end notifications

  if (updatedStatus.status === 'Accepted') {
    const updateCollaboration = await Collaborate.findByIdAndUpdate(
      collaborationId,
      {
        $set: {
          typeStatus: 'Completed',
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return updateCollaboration;
  } else if (updatedStatus.status === 'Rejected') {
    const update = await Collaborate.findByIdAndUpdate(
      collaborationId,
      {
        $set: {
          typeStatus: 'Rejected',
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return update;
  }

  return updatedStatus;
};

export const InterestService = {
  getAllInterest,
  updatedInterestStautsToDb,
};
