import Stripe from 'stripe';
import { Subscribation } from '../../app/modules/subscribtion/subscribtion.model';

const handleInvoicePaymentSucceeded = async (invoice: any) => {
  try {
    const {
      customer,
      subscription,
      amount_paid,
      customer_email,
      customer_name,
    } = invoice;

    // Extracting necessary details from the invoice
    const customerId = customer;
    const subscriptionId = subscription;
    const priceAmount = amount_paid / 100 || 0;
    const email = customer_email;
    const name = customer_name;

    // Update the subscription in the database or create if it doesn't exist
    const subscriptionInDB = await Subscribation.findOneAndUpdate(
      { subscriptionId },
      { priceAmount, email, name },
      { new: true, upsert: true } // If not found, create a new record
    );

    console.log(
      'Invoice payment succeeded, subscription updated in DB:',
      subscriptionInDB
    );
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
};

export default handleInvoicePaymentSucceeded;
