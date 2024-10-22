import Stripe from 'stripe';
import { Subscribation } from '../../app/modules/subscribtion/subscribtion.model';

const handleCheckoutSessionCompleted = async (
  session: Stripe.Checkout.Session
) => {
  console.log(session, 'session');
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
      customerId,
      plan,
      subscriptionId,
      status,
      priceAmount,
      email,
      name,
    });

    console.log('Subscription created and saved to DB:', {
      customerId,
      plan,
      subscriptionId,
      email,
      name,
      priceAmount, // Log priceAmount for verification
    });
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
};

export default handleCheckoutSessionCompleted;
