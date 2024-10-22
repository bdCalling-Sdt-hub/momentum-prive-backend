import QueryBuilder from '../../builder/QueryBuilder';
import { IInvite } from './invite.interface';
import { Invite } from './invite.model';

const createInviteToDB = async (payload: Partial<IInvite>) => {
  const result = await Invite.create(payload);
  return result;
};

const getAllInvites = async (query: Record<string, unknown>) => {
  const inviteBuilder = new QueryBuilder(
    Invite.find()
      .populate({
        path: 'campaign',
        populate: {
          path: 'brand',
        },
      })
      .populate('influencer'),
    query
  )
    .search(['campaign', 'influencer'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await inviteBuilder.modelQuery;
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
