import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Collaborate } from '../collaboration/collaboration.model';
import { IInterest } from './interest.interface';
import { Interest } from './interest.model';

const getAllInterest = async () => {
  const result = await Interest.find()
    .populate('campaign')
    .populate('influencer');
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
