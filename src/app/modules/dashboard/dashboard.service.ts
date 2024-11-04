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
const getMonthlyUserRegistration = async () => {
  const totalUsers = await User.countDocuments();

  const result = await User.aggregate([
    // Optionally filter by active status
    // { $match: { status: 'active' } },
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
    },
  ]);

  return result;
};

// const getMonthlyUserRegistration = async () => {
//   const [monthlyRegistrations, totalUsers] = await Promise.all([
//     User.aggregate([
//       // Optionally filter by active status
//       // { $match: { status: 'active' } },
//       {
//         $group: {
//           _id: {
//             year: { $year: '$createdAt' }, // Group by year
//             month: { $month: '$createdAt' }, // Group by month
//           },
//           totalRegistrations: { $sum: 1 }, // Count of registrations
//         },
//       },
//       {
//         $project: {
//           _id: 0, // Exclude default _id
//           month: {
//             $arrayElemAt: [
//               [
//                 'Jan',
//                 'Feb',
//                 'Mar',
//                 'Apr',
//                 'May',
//                 'Jun',
//                 'Jul',
//                 'Aug',
//                 'Sep',
//                 'Oct',
//                 'Nov',
//                 'Dec',
//               ],
//               { $subtract: ['$_id.month', 1] }, // Adjust month index
//             ],
//           },
//           year: '$_id.year', // Include the year in the output
//           totalRegistrations: '$totalRegistrations', // Reference totalRegistrations correctly
//         },
//       },
//       {
//         $sort: { year: 1, month: 1 }, // Sort by year and month
//       },
//     ]),
//     User.countDocuments(), // Count total users
//   ]);

//   return {
//     monthlyRegistrations,
//     totalUsers,
//   };
// };

export const DashboardService = {
  getAllBrandStatistics,
  getAllInfluencerStatistics,
  getMonthlyEarnings,
  getMonthlyUserRegistration,
};
