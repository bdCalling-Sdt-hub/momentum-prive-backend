import cors from 'cors';
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

const app = express();

//morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

//body parser
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

//file retrieve
app.use(express.static('uploads'));

//router
app.use('/api/v1', router);

// cron job

export const checkExpiredSubscriptions = async () => {
  try {
    const currentDate = new Date();

    const subscriptions = await Subscribation.find({}).exec();

    for (const subscription of subscriptions) {
      const currentPeriodEnd = subscription.currentPeriodEnd;

      if (currentPeriodEnd) {
        try {
          const expirationDate = parseCustomDateFormat(currentPeriodEnd);

          if (
            (expirationDate < currentDate ||
              expirationDate.toDateString() === currentDate.toDateString()) &&
            subscription.status === 'active'
          ) {
            await Subscribation.updateOne(
              { _id: subscription._id },
              { status: 'expired' }
            );
            console.log(`Subscription ${subscription._id} updated to expired.`);
          }
        } catch (error) {
          console.error(
            `Error parsing date for subscription ${subscription._id}:`
          );
        }
      }
    }
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Error updating subscriptions ${error}`
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
