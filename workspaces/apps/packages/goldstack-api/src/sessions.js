'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.postPurchase =
  exports.putSessionHandler =
  exports.getSessionHandler =
  exports.postSessionHandler =
    void 0;
const client_ses_1 = require('@aws-sdk/client-ses');
const auth_1 = require('@goldstack/auth');
const goldstack_email_send_1 = require('@goldstack/goldstack-email-send');
const project_repository_1 = require('@goldstack/project-repository');
const session_repository_1 = require('@goldstack/session-repository');
const utils_sh_1 = require('@goldstack/utils-sh');
const assert_1 = __importDefault(require('assert'));
const crypto_random_string_1 = __importDefault(require('crypto-random-string'));
const express_1 = require('express');
const uuid_1 = require('uuid');
const stripe_1 = require('./lib/stripe');
const docLinks_1 = require('./utils/docLinks');
const router = (0, express_1.Router)();
if (!process.env.CORS) {
  throw new Error('Cannot start express server. Expects CORS header to be set');
}
function hostname(url) {
  const splitComponents = url.indexOf('://') > -1 ? url.split('/')[2] : url.split('/')[0];
  return splitComponents.split(':')[0];
}
const postSessionHandler = async (req, res) => {
  try {
    console.debug('Post session handler called');
    const domain = process.env.CORS;
    const url = hostname(domain || 'error no domain specified');
    const sessionValidityInSeconds = 32 * 24 * 60 * 60 * 1000; // around a month
    const repo = await (0, session_repository_1.connectSessionRepository)();
    // Check if token is injected
    const { injectToken } = req.body;
    if (injectToken) {
      const sessionData = await repo.readSession(injectToken);
      if (!sessionData || sessionData.sessionId !== injectToken) {
        res.status(400).json({ errorMessage: 'Invalid token' });
        return;
      }
      if (new Date(sessionData.validUntil).getTime() < Date.now()) {
        res.status(401).json({ errorMessage: 'Session expired' });
        return;
      }
      res
        .cookie('userToken', (0, auth_1.sessionUser)(injectToken), {
          maxAge: sessionValidityInSeconds,
          httpOnly: true,
          domain: url,
          sameSite: true,
          path: '/',
        })
        .status(200)
        .json({ result: 'success' });
      return;
    }
    // check if token already defined
    const { userToken } = req.cookies;
    if (userToken) {
      const sessionData = await repo.readSession(userToken);
      // if token already defined, do not create new session
      if (
        sessionData &&
        new Date(
          sessionData === null || sessionData === void 0 ? void 0 : sessionData.validUntil,
        ).getTime() > Date.now()
      ) {
        res.status(200).json({ result: 'success' });
        return;
      }
    }
    const sessionId = (0, crypto_random_string_1.default)({ length: 42 });
    await repo.createSession(
      sessionId,
      new Date(Date.now() + sessionValidityInSeconds * 1000).toISOString(),
    );
    res
      .cookie('userToken', (0, auth_1.sessionUser)(sessionId), {
        maxAge: sessionValidityInSeconds,
        httpOnly: true,
        domain: url,
        sameSite: true,
        path: '/',
      })
      .status(200)
      .json({ result: 'success' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ errorMessage: `Cannot create session. ${e.message}` });
  }
};
exports.postSessionHandler = postSessionHandler;
const isPaymentReceived = async (sessionData) => {
  if (!sessionData.coupon && !sessionData.stripeId) {
    return false;
  }
  if (sessionData.coupon) {
    return true;
  }
  (0, assert_1.default)(sessionData.stripeId);
  return await (0, stripe_1.isSessionPaid)({ sessionId: sessionData.stripeId });
};
const getSessionHandler = async (req, res) => {
  try {
    const { userToken } = req.cookies;
    if (!userToken) {
      res.status(400).json({ errorMessage: 'Expected userToken cookie to be set' });
      return;
    }
    const repo = await (0, session_repository_1.connectSessionRepository)();
    const sessionData = await repo.readSession(userToken);
    if (!sessionData) {
      res.status(401).json({ errorMessage: 'Invalid session id' });
      return;
    }
    const paymentReceived = await isPaymentReceived(sessionData);
    if (paymentReceived) {
      res.status(200).json({
        paymentReceived,
      });
      return;
    }
    res.status(200).json({
      paymentReceived,
      stripeId: sessionData.stripeId,
    });
  } catch (e) {
    console.log(`Error while getting session details: ${e.message}`);
    console.error(e);
    res.status(500).json({ errorMessage: `Cannot retrieve session. Error: ${e.message}` });
  }
};
exports.getSessionHandler = getSessionHandler;
const performPurchase = async (params) => {
  const ses = await (0, goldstack_email_send_1.connect)();
  const sessionData = await params.repo.readSession(params.userToken);
  (0, assert_1.default)(sessionData);
  console.debug(`Sending out download URL: ${params.downloadUrl} to ${params.email}`);
  const repo = await (0, project_repository_1.connectProjectRepository)();
  const workspacePath = `${(0, utils_sh_1.goldstackLocalDir)()}work/session-purchase/${params.projectId}/${(0, uuid_1.v4)()}/`;
  await repo.downloadProject(params.projectId, workspacePath);
  const docLinks = [
    {
      link: 'https://docs.goldstack.party/docs/goldstack/getting-started',
      packageName: 'First steps',
    },
    ...(await (0, docLinks_1.getDocLinks)(workspacePath)),
  ];
  const gettingStartedLinks = docLinks
    .map((docLink) => {
      return `- ${docLink.packageName}: ${docLink.link}`;
    })
    .join('\n');
  await params.repo.storePurchase({
    sessionId: sessionData.sessionId,
    projectId: params.projectId,
    packageId: params.packageId,
  });
  if (params.email) {
    await ses.send(
      new client_ses_1.SendEmailCommand({
        Destination: {
          ToAddresses: [params.email],
          BccAddresses: ['maxrohde.public@gmail.com'],
        },
        Message: {
          Subject: { Charset: 'UTF-8', Data: 'Goldstack Template' },
          Body: {
            Text: {
              Charset: 'UTF-8',
              Data:
                'Thank you for selecting a Goldstack template!\n\n' +
                'Please keep the following download link for your reference\n\n' +
                `${params.downloadUrl}?token=${sessionData === null || sessionData === void 0 ? void 0 : sessionData.sessionId}\n\n` +
                'You can also use this link to create new templates.\n\n' +
                'The link will be valid for 30 days from your template download.\n\n' +
                'To get started, please see the following getting started guides:\n\n' +
                gettingStartedLinks,
            },
          },
        },
        Source: `"Goldstack" <hi@${await ((0, goldstack_email_send_1.getFromDomain))()}>`,
      }),
    );
  } else {
    await ses.send(
      new client_ses_1.SendEmailCommand({
        Destination: {
          ToAddresses: ['maxrohde.public@gmail.com'],
        },
        Message: {
          Subject: {
            Charset: 'UTF-8',
            Data: 'Goldstack Template download w/o email',
          },
          Body: {
            Text: {
              Charset: 'UTF-8',
              Data: `Modules\n\n${gettingStartedLinks}`,
            },
          },
        },
        Source: `"Goldstack" <hi@${await ((0, goldstack_email_send_1.getFromDomain))()}>`,
      }),
    );
  }
  await (0, utils_sh_1.rmSafe)(workspacePath);
};
const putSessionHandler = async (req, res) => {
  try {
    const { email, coupon, downloadUrl, projectId, packageId } = req.body;
    const { userToken } = req.cookies;
    if (!userToken) {
      res.status(400).json({ errorMessage: 'Expected userToken cookie to be set' });
      return;
    }
    const repo = await (0, session_repository_1.connectSessionRepository)();
    const sessionData = await repo.readSession(userToken);
    if (!sessionData) {
      res.status(401).json({ errorMessage: 'Unknown session' });
      return;
    }
    if (new Date(sessionData.validUntil).getTime() < Date.now()) {
      res.status(401).json({ errorMessage: 'Session expired' });
      return;
    }
    let validatedCoupon;
    if (coupon !== 'FREEBETA') {
      validatedCoupon = undefined;
    } else {
      validatedCoupon = coupon;
    }
    if (coupon && !validatedCoupon) {
      res.status(400).json({ error: 'invalid-coupon' });
      return;
    }
    if (!validatedCoupon) {
      const stripeId = await (0, stripe_1.createSession)({ projectId, packageId, email });
      await repo.storeStripeId({
        sessionId: userToken,
        stripeId: stripeId.id,
      });
    }
    await repo.storePayment({
      sessionId: userToken,
      email,
      coupon: validatedCoupon,
    });
    if (downloadUrl) {
      await performPurchase({
        userToken,
        downloadUrl,
        repo,
        projectId,
        packageId,
        email,
      });
    }
    res.status(200).json({ result: 'success' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ errorMessage: `Cannot update session. ${e.message}` });
  }
};
exports.putSessionHandler = putSessionHandler;
const postPurchase = async (req, res) => {
  try {
    const { projectId, downloadUrl, packageId } = req.body;
    const repo = await (0, session_repository_1.connectSessionRepository)();
    const { userToken } = req.cookies;
    if (!userToken) {
      res.status(400).json({ errorMessage: 'Expected userToken cookie to be set' });
      return;
    }
    const sessionData = await repo.readSession(userToken);
    if (!sessionData) {
      res.status(401).json({ errorMessage: 'Unknown session' });
      return;
    }
    if (new Date(sessionData.validUntil).getTime() < Date.now()) {
      res.status(401).json({ errorMessage: 'Session expired' });
      return;
    }
    if (!isPaymentReceived(sessionData)) {
      console.error(
        'Invalid attempt to purchase template. ProjectId:',
        projectId,
        'PackageId:',
        packageId,
        'SessionId',
        sessionData.sessionId,
      );
      res.status(400).json({
        errorMessage:
          'Attempted to perform purchase for session for which no payment has been stored.',
      });
      return;
    }
    await performPurchase({
      userToken,
      email: sessionData.email || '',
      projectId,
      packageId,
      downloadUrl,
      repo,
    });
    res.status(200).json({ result: 'success' });
    return;
  } catch (e) {
    console.error('Error during postPurchase');
    console.error(e);
    res.status(500).json({ errorMessage: `Cannot process purchase ${e.message}` });
    return;
  }
};
exports.postPurchase = postPurchase;
router.post('/', exports.postSessionHandler);
router.get('/', exports.getSessionHandler);
router.put('/', exports.putSessionHandler);
router.post('/purchase', exports.postPurchase);
exports.default = router;
//# sourceMappingURL=sessions.js.map
