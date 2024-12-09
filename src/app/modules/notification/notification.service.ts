import { query } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Notification } from './notification.model';

const getNotificationToDb = async (user: JwtPayload) => {
  const result = await Notification.find({ receiver: user.id }).sort({
    createdAt: -1,
  });

  const unredCount = await Notification.countDocuments({
    receiver: user.id,
    read: false,
  });

  const data = {
    result,
    unredCount,
  };

  return data;
};

const readNotification = async (user: JwtPayload) => {
  const result = await Notification.updateMany(
    { receiver: user.id },
    { read: true }
  );
  return result;
};

const adminNotification = async (query: Record<string, unknown>) => {
  const { searchTerm, page, limit, ...filterData } = query;
  const anyConditions: any[] = [{ type: 'ADMIN' }];

  // Add filters based on additional fields in filterData
  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.entries(filterData).map(
      ([field, value]) => ({ [field]: value })
    );
    anyConditions.push({ $and: filterConditions });
  }

  // Combine all conditions
  const whereConditions =
    anyConditions.length > 0 ? { $and: anyConditions } : {};

  // Pagination setup
  const pages = parseInt(page as string, 10) || 1;
  const size = parseInt(limit as string, 10) || 10;
  const skip = (pages - 1) * size;

  // Fetch notifications
  const result = await Notification.find(whereConditions)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(size)
    .lean();

  const count = await Notification.countDocuments(whereConditions);

  return {
    result,
    meta: {
      page: pages,
      total: count,
    },
  };
};

const adminReadNotification = async () => {
  const result = await Notification.updateMany(
    { type: 'ADMIN' },
    { read: true }
  );
  return result;
};

export const NotificationService = {
  getNotificationToDb,
  readNotification,
  adminNotification,
  adminReadNotification,
};
