import { Brand } from '../brand/brand.model';
import { Campaign } from '../campaign/campaign.model';
import { Collaborate } from '../collaboration/collaboration.model';
import { Influencer } from '../influencer/influencer.model';
import { Subscribation } from '../subscribtion/subscribtion.model';
import { User } from '../user/user.model';

const getAllBrandStatistics = async () => {
  try {
    const [totalCampaigns, totalBrands, totalRevenue] = await Promise.all([
      Campaign.countDocuments(),
      Brand.countDocuments(),
      Subscribation.aggregate([
        {
          $group: {
            _id: null,
            totalPriceAmount: { $sum: '$priceAmount' },
          },
        },
      ]).then(result => (result.length > 0 ? result[0].totalPriceAmount : 0)),
    ]);

    return {
      totalCampaigns,
      totalBrands,
      totalRevenue,
    };
  } catch (error) {
    throw new Error('Unable to fetch statistics');
  }
};

const getAllInfluencerStatistics = async () => {
  try {
    const [totalCollaboration, totalInfluencer, monthlyRevenue] =
      await Promise.all([
        Collaborate.countDocuments(),
        Influencer.countDocuments(),
        Subscribation.aggregate([
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
              },
              totalPriceAmount: { $sum: '$priceAmount' },
            },
          },
          {
            $sort: { '_id.year': -1, '_id.month': -1 },
          },
          {
            $limit: 1, // Get only the latest month
          },
        ]),
      ]);

    return {
      totalInfluencer,
      totalCollaboration,
      latestMonthlyRevenue: monthlyRevenue[0]
        ? monthlyRevenue[0].totalPriceAmount
        : 0,
    };
  } catch (error) {
    throw new Error('Unable to fetch statistics');
  }
};

const getMonthlyEarnings = async () => {
  const result = await Subscribation.aggregate([
    // { $match: { status: 'active' } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        totalAmount: { $sum: '$priceAmount' },
      },
    },
    {
      $addFields: {
        month: {
          $dateToString: {
            format: '%b',
            date: { $dateFromString: { dateString: '$_id' } },
          },
        },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
  return result;
};

const getMonthlyUserRegistration = async (year?: number) => {
  const totalUsers = await User.countDocuments();

  // Build the aggregation pipeline with conditional stages
  const pipeline: any[] = [];

  // Only add the $match stage if a specific year is provided
  if (year) {
    pipeline.push({
      $match: {
        $expr: {
          $eq: [{ $year: '$createdAt' }, year],
        },
      },
    });
  }

  // Add the remaining stages
  pipeline.push(
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        totalRegistrations: { $sum: 1 },
      },
    },
    {
      $addFields: {
        month: {
          $arrayElemAt: [
            [
              'Jan',
              'Feb',
              'Mar',
              'Apr',
              'May',
              'Jun',
              'Jul',
              'Aug',
              'Sep',
              'Oct',
              'Nov',
              'Dec',
            ],
            { $subtract: ['$_id.month', 1] },
          ],
        },
      },
    },
    {
      $project: {
        _id: 0,
        month: 1,
        year: '$_id.year',
        totalRegistrations: 1,
        totalUsers: totalUsers,
      },
    },
    {
      $sort: { year: 1, month: 1 },
    }
  );

  const result = await User.aggregate(pipeline);
  return result;
};

export const DashboardService = {
  getAllBrandStatistics,
  getAllInfluencerStatistics,
  getMonthlyEarnings,
  getMonthlyUserRegistration,
};
