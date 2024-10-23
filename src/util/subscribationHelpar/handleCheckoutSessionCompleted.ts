import Stripe from 'stripe';
import { Subscribation } from '../../app/modules/subscribtion/subscribtion.model';

const handleCheckoutSessionCompleted = async (
  session: Stripe.Checkout.Session
) => {
  try {
    const customerId = session.customer;
    const subscriptionId = session.subscription as string;
    const plan = session.subscription || 'unknown';
    const status = 'active';

    // Divide amount_total by 100 to convert from cents to dollars
    const priceAmount = (session.amount_total || 0) / 100;

    const email = session.customer_email;
    const name = session.customer_details?.name || 'Unknown';

    await Subscribation.create({
      subscriptionId,
      status,
      priceAmount,
    });
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
};

export default handleCheckoutSessionCompleted;
