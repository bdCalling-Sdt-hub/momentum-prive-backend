import Stripe from 'stripe';
import { Subscribation } from '../../app/modules/subscribtion/subscribtion.model';
import { formatDate } from '../../app/modules/subscribtion/timeFormat';
import { stripe } from '../../app/modules/subscribtion/subscribtion.service';

const handleSubscriptionUpdated = async (session: Stripe.Checkout.Session) => {
  try {
    const { id, customer, subscription } = session;
    const subscriptionId = subscription as string; // Subscription ID is stored here
    const customerId = customer as string;

    // Fetch the actual subscription from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscriptionId
    );

    const { status, current_period_end, current_period_start } =
      stripeSubscription;

    // currentPeriodStart: formatDate(
    //   new Date(updatedSubscription.current_period_start * 1000)
    // ),

    // Find and update the subscription in the database
    await Subscribation.findOneAndUpdate(
      { subscriptionId },
      {
        status,
        currentPeriodEnd: formatDate(new Date(current_period_end * 1000)),
        currentPeriodStart: formatDate(new Date(current_period_start * 1000)),
      },
      { new: true, upsert: true } // If not found, create a new record
    );
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
};

export default handleSubscriptionUpdated;
// : subscription.cancellation_details?.reason
