// import Stripe from 'stripe';
// import { Subscribation } from '../../app/modules/subscribtion/subscribtion.model';
// import { User } from '../../app/modules/user/user.model';

import Stripe from 'stripe';
import { stripe } from '../../app/modules/subscribtion/subscribtion.service';
import { Subscribation } from '../../app/modules/subscribtion/subscribtion.model';
import { User } from '../../app/modules/user/user.model';

// async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
//   const { userId, packageId } = subscription.metadata;

//   await Subscribation.findOneAndUpdate(
//     { subscriptionId: subscription.id },
//     {
//       status: subscription.status,
//       currentPeriodStart: new Date(subscription.current_period_start * 1000),
//       currentPeriodEnd: new Date(subscription.current_period_end * 1000),
//     },
//     { new: true }
//   );
// }

// async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
//   const { userId } = subscription.metadata;

//   await Subscribation.findOneAndUpdate(
//     { subscriptionId: subscription.id },
//     {
//       status: subscription.status,
//       currentPeriodStart: new Date(subscription.current_period_start * 1000),
//       currentPeriodEnd: new Date(subscription.current_period_end * 1000),
//     }
//   );

//   // Update user subscription status if necessary
//   if (subscription.status === 'active') {
//     await User.findByIdAndUpdate(userId, { $set: { subscription: true } });
//   } else if (
//     subscription.status === 'canceled' ||
//     subscription.status === 'unpaid'
//   ) {
//     await User.findByIdAndUpdate(userId, { $set: { subscription: false } });
//   }
// }

// async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
//   const { userId } = subscription.metadata;

//   await Subscribation.findOneAndUpdate(
//     { subscriptionId: subscription.id },
//     { status: 'cancelled' }
//   );

//   await User.findByIdAndUpdate(userId, {
//     $set: {
//       subscription: false,
//       title: 'free', // Reset to free tier
//     },
//   });
// }

// async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
//   if (!invoice.subscription) return;

//   const subscription = await Subscribation.findOne({
//     subscriptionId: invoice.subscription,
//   });

//   if (!subscription) return;

//   await Subscribation.findByIdAndUpdate(subscription._id, {
//     status: 'active',
//     lastPaymentStatus: 'succeeded',
//     lastPaymentDate: new Date(),
//   });
// }

// async function handlePaymentFailed(invoice: Stripe.Invoice) {
//   if (!invoice.subscription) return;

//   const subscription = await Subscribation.findOne({
//     subscriptionId: invoice.subscription,
//   });

//   if (!subscription) return;

//   await Subscribation.findByIdAndUpdate(subscription._id, {
//     status: 'past_due',
//     lastPaymentStatus: 'failed',
//     lastPaymentAttempt: new Date(),
//   });

//   // Optionally notify the user about payment failure
//   // await notifyUserAboutPaymentFailure(subscription.user);
// }

// export const SubscribationHelper = {
//   handleSubscriptionCreated,
//   handlePaymentFailed,
//   handlePaymentSucceeded,
//   handleSubscriptionUpdated,
//   handleSubscriptionCancelled,
// };

const handleSubscriptionCreated = async (subscription: Stripe.Subscription) => {
  const customerId = subscription.customer as string;
  const customer = await stripe.customers.retrieve(customerId);

  if ('deleted' in customer) return null;

  const subscriptionData = await Subscribation.findOneAndUpdate(
    { subscriptionId: subscription.id },
    {
      subscriptionId: subscription.id,
      customerId: customerId,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      customerEmail: customer.email,
    },
    { upsert: true, new: true }
  );

  return subscriptionData;
};

const handleSubscriptionUpdated = async (subscription: Stripe.Subscription) => {
  const { userId } = subscription.metadata;

  const updatedSubscription = await Subscribation.findOneAndUpdate(
    { subscriptionId: subscription.id },
    {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
    { new: true }
  );

  if (userId) {
    await User.findByIdAndUpdate(
      userId,
      { subscription: subscription.status === 'active' },
      { new: true }
    );
  }

  return updatedSubscription;
};

const handleSubscriptionDeleted = async (subscription: Stripe.Subscription) => {
  const { userId } = subscription.metadata;

  const cancelledSubscription = await Subscribation.findOneAndUpdate(
    { subscriptionId: subscription.id },
    { status: 'cancelled' },
    { new: true }
  );

  if (userId) {
    await User.findByIdAndUpdate(
      userId,
      {
        subscription: false,
        title: 'free',
      },
      { new: true }
    );
  }

  return cancelledSubscription;
};

const handleInvoicePaid = async (invoice: Stripe.Invoice) => {
  if (typeof invoice.subscription === 'string') {
    const updatedSubscription = await Subscribation.findOneAndUpdate(
      { subscriptionId: invoice.subscription },
      {
        status: 'active',
        lastPaymentStatus: 'succeeded',
        lastPaymentDate: new Date(),
      },
      { new: true }
    );
    return updatedSubscription;
  }
  return null;
};

const handleInvoicePaymentFailed = async (invoice: Stripe.Invoice) => {
  if (typeof invoice.subscription === 'string') {
    const updatedSubscription = await Subscribation.findOneAndUpdate(
      { subscriptionId: invoice.subscription },
      {
        status: 'past_due',
        lastPaymentStatus: 'failed',
        lastPaymentAttempt: new Date(),
      },
      { new: true }
    );
    return updatedSubscription;
  }
  return null;
};

export const subscriptionServicessss = {
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
};
