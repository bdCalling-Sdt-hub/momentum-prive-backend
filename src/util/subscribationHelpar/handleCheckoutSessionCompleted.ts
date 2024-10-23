import Stripe from 'stripe';
import { Subscribation } from '../../app/modules/subscribtion/subscribtion.model';
import { stripe } from '../../app/modules/subscribtion/subscribtion.service';
import { formatDate } from '../../app/modules/subscribtion/timeFormat';

const handleCheckoutSessionCompleted = async (
  session: Stripe.Checkout.Session
) => {
  try {
    const customerId = session.customer;
    const subscriptionId = session.subscription as string;
    const plan = session.subscription || 'unknown';
    const status = 'active';

    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscriptionId
    );

    const { current_period_end, current_period_start } = stripeSubscription;

    // Divide amount_total by 100 to convert from cents to dollars
    const priceAmount = (session.amount_total || 0) / 100;

    const email = session.customer_email;
    const name = session.customer_details?.name || 'Unknown';

    await Subscribation.create({
      subscriptionId,
      status,
      priceAmount,
      currentPeriodEnd: formatDate(new Date(current_period_end * 1000)),
      currentPeriodStart: formatDate(new Date(current_period_start * 1000)),
    });
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
};

export default handleCheckoutSessionCompleted;
