'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.isSessionPaid = exports.createSession = void 0;
const assert_1 = __importDefault(require('assert'));
const stripe_1 = __importDefault(require('stripe'));
const initStripe = () => {
  (0, assert_1.default)(
    process.env.STRIPE_API_KEY,
    'Environment variable STRIPE_API_KEY not defined',
  );
  const stripe = new stripe_1.default(process.env.STRIPE_API_KEY, {
    apiVersion: '2020-08-27',
  });
  return stripe;
};
const createSession = async (params) => {
  const stripe = initStripe();
  (0, assert_1.default)(process.env.CORS, 'Environment variable CORS not defined.');
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
exports.createSession = createSession;
const isSessionPaid = async (params) => {
  const stripe = initStripe();
  const session = await stripe.checkout.sessions.retrieve(params.sessionId);
  return session.payment_status === 'paid';
};
exports.isSessionPaid = isSessionPaid;
//# sourceMappingURL=stripe.js.map
