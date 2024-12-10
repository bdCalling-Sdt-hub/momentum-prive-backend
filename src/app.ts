import cors from 'cors';
import colors from 'colors';
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './routes';

import cookieParser from 'cookie-parser';

import { Morgan } from './shared/morgen';
import { Subscribation } from './app/modules/subscribtion/subscribtion.model';
import { parseCustomDateFormat } from './util/cornJobHelper';

import cron from 'node-cron';
import ApiError from './errors/ApiError';
import { User } from './app/modules/user/user.model';
import { logger } from './shared/logger';

const app = express();

//morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

//body parser
// app.use(cors());
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

//file retrieve
app.use(express.static('uploads'));

//router
app.use('/api/v1', router);

export const checkExpiredSubscriptions = async () => {
  try {
    const currentDate = new Date();

    const subscriptions = await Subscribation.find({ status: 'active' }).exec();

    for (const subscription of subscriptions) {
      const currentPeriodEnd = subscription.currentPeriodEnd;

      if (currentPeriodEnd) {
        try {
          const expirationDate = parseCustomDateFormat(currentPeriodEnd);

          // Check if the subscription's current period has expired
          if (expirationDate <= currentDate) {
            // Expire the subscription
            await Subscribation.updateOne(
              { _id: subscription._id },
              { status: 'expired' }
            );

            const user = await User.findOneAndUpdate(
              { _id: subscription.user },
              { $set: { subscription: false } },
              { new: true }
            );

            // Check if the user update was successful
            if (user) {
              logger.info(
                colors.green(`User ${user._id} subscription set to false.`)
              );
            } else {
              logger.info(
                colors.red(
                  `Failed to update user subscription for subscription ${subscription._id}.`
                )
              );
            }
            logger.info(
              colors.yellow(
                `Subscription ${subscription._id} updated to expired.`
              )
            );
          }
        } catch (error) {
          logger.info(
            colors.red(
              `Error parsing date for subscription ${subscription._id}: ${error}`
            )
          );
        }
      }
    }
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Error updating subscriptions: ${error}`
    );
  }
};

// Schedule the cron job to run every hour
cron.schedule('* * * * *', checkExpiredSubscriptions);

//live response
app.get('/', (req: Request, res: Response) => {
  res.send(
    '<h1 style="text-align:center; color:#A55FEF; font-family:Verdana;">Hey, How can I assist you today!</h1>'
  );
});

//global error handle
app.use(globalErrorHandler);

//handle not found route;
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Not found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API DOESN'T EXIST",
      },
    ],
  });
});

export default app;
