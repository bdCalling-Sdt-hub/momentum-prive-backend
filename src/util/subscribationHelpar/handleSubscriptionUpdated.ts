import { Subscribation } from '../../app/modules/subscribtion/subscribtion.model';

const handleSubscriptionUpdated = async (subscription: any) => {
  try {
    const { id, customer, plan, status } = subscription;
    const subscriptionId = id;
    const customerId = customer;
    const planId = plan.id;

    // Find and update the subscription in the database
    const subscriptionInDB = await Subscribation.findOneAndUpdate(
      { subscriptionId },
      { plan: planId, status },
      { new: true, upsert: true } // If not found, create a new record
    );

    console.log('Subscription updated in DB:', subscriptionInDB);
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
};

export default handleSubscriptionUpdated;
