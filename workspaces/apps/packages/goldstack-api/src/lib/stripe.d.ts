import Stripe from 'stripe';
export declare const createSession: (params: {
  projectId: string;
  packageId: string;
  email: string;
}) => Promise<Stripe.Response<Stripe.Checkout.Session>>;
export declare const isSessionPaid: (params: { sessionId: string }) => Promise<boolean>;
//# sourceMappingURL=stripe.d.ts.map
