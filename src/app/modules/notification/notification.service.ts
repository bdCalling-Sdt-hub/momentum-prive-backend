import { JwtPayload } from 'jsonwebtoken';
import { Notification } from './notification.model';

const getNotificationToDb = async (user: JwtPayload) => {
  const result = await Notification.find({ receiver: user.id });

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

const adminNotification = async () => {
  const result = await Notification.find({ type: 'ADMIN' });
  return result;
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
