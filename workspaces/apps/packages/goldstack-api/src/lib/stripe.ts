import Stripe from 'stripe';
import assert from 'assert';

const initStripe = (): Stripe => {
  assert(process.env.STRIPE_API_KEY, 'Environment variable STRIPE_API_KEY not defined');

  const stripe = new Stripe(process.env.STRIPE_API_KEY, {
    apiVersion: '2020-08-27',
  });

  return stripe;
};

export const createSession = async (params: {
  projectId: string;
  packageId: string;
  email: string;
}): Promise<Stripe.Response<Stripe.Checkout.Session>> => {
  const stripe = initStripe();
  assert(process.env.CORS, 'Environment variable CORS not defined.');
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: '1 Month Unlimited Templates',
            // images: ['https://i.imgur.com/EHyR2nP.png'],
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    customer_email: params.email,
    mode: 'payment',
    success_url: `${process.env.CORS}/projects/${params.projectId}/packages/${params.packageId}/download`,
    cancel_url: `${process.env.CORS}/projects/${params.projectId}/packages/${params.packageId}/get-template`,
  });
  return session;
};

export const isSessionPaid = async (params: { sessionId: string }): Promise<boolean> => {
  const stripe = initStripe();
  const session = await stripe.checkout.sessions.retrieve(params.sessionId);
  return session.payment_status === 'paid';
};

export const updateEmail = async (params: { sessionId: string; email: string }): Promise<void> => {
  const stripe = initStripe();
};
