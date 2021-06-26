import { Router, Request, Response } from 'express';

import randomString from 'crypto-random-string';

import { sessionUser } from '@goldstack/auth';

import { isSessionPaid, createSession } from './lib/stripe';

import {
  connectSessionRepository,
  SessionRepository,
  SessionData,
} from '@goldstack/session-repository';

import { connect, getFromDomain } from '@goldstack/goldstack-email-send';
import assert from 'assert';

import { connectProjectRepository } from '@goldstack/project-repository';

import { v4 as uuid4 } from 'uuid';
import { getDocLinks } from './utils/docLinks';
import { rmSafe, tempDir } from '@goldstack/utils-sh';

const router = Router();

if (!process.env.CORS) {
  throw new Error('Cannot start express server. Expects CORS header to be set');
}

function hostname(url: string): string {
  const splitComponents =
    url.indexOf('://') > -1 ? url.split('/')[2] : url.split('/')[0];
  return splitComponents.split(':')[0];
}

export const postSessionHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.debug('Post session handler called');
    const domain = process.env.CORS;
    const url = hostname(domain || 'error no domain specified');

    const sessionValidityInSeconds = 32 * 24 * 60 * 60 * 1000; // around a month

    const repo = await connectSessionRepository();

    // Check if token is injected
    const { injectToken } = req.body;
    if (injectToken) {
      const sessionData = await repo.readSession(injectToken);
      if (!sessionData || sessionData.sessionId !== injectToken) {
        res.status(400).json({ errorMessage: 'Invalid token' });
        return;
      }
      if (new Date(sessionData.validUntil).getTime() < new Date().getTime()) {
        res.status(401).json({ errorMessage: 'Session expired' });

        return;
      }
      res
        .cookie('userToken', sessionUser(injectToken), {
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
        new Date(sessionData?.validUntil).getTime() > new Date().getTime()
      ) {
        res.status(200).json({ result: 'success' });
        return;
      }
    }

    const sessionId = randomString({ length: 42 });
    await repo.createSession(
      sessionId,
      new Date(
        new Date().getTime() + sessionValidityInSeconds * 1000
      ).toISOString()
    );

    res
      .cookie('userToken', sessionUser(sessionId), {
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
    res
      .status(500)
      .json({ errorMessage: `Cannot create session. ${e.message}` });
  }
};

const isPaymentReceived = async (
  sessionData: SessionData
): Promise<boolean> => {
  if (!sessionData.coupon && !sessionData.stripeId) {
    return false;
  }
  if (sessionData.coupon) {
    return true;
  }

  assert(sessionData.stripeId);

  return await isSessionPaid({ sessionId: sessionData.stripeId });
};

export const getSessionHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userToken } = req.cookies;
    if (!userToken) {
      res
        .status(400)
        .json({ errorMessage: 'Expected userToken cookie to be set' });
      return;
    }
    const repo = await connectSessionRepository();
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
    console.log('Error while getting session details: ' + e.message);
    console.error(e);
    res
      .status(500)
      .json({ errorMessage: 'Cannot retrieve session. Error: ' + e.message });
  }
};

const performPurchase = async (params: {
  userToken: string;
  email: string;
  projectId: string;
  packageId: string;
  downloadUrl: string;
  repo: SessionRepository;
}): Promise<void> => {
  const ses = await connect();
  const sessionData = await params.repo.readSession(params.userToken);
  assert(sessionData);
  console.debug(
    `Sending out download URL: ${params.downloadUrl} to ${params.email}`
  );

  const repo = await connectProjectRepository();
  const workspacePath = `${tempDir()}work/session-purchase/${
    params.projectId
  }/${uuid4()}/`;
  await repo.downloadProject(params.projectId, workspacePath);

  const docLinks = [
    {
      link: 'https://docs.goldstack.party/docs/goldstack/getting-started',
      packageName: 'First steps',
    },
    ...(await getDocLinks(workspacePath)),
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
  await ses
    .sendEmail({
      Destination: {
        ToAddresses: [params.email],
        BccAddresses: ['mxrogm@gmail.com'],
      },
      Message: {
        Subject: { Charset: 'UTF-8', Data: 'Goldstack Template Purchase' },
        Body: {
          Text: {
            Charset: 'UTF-8',
            Data:
              'Thank you for selecting a Goldstack template!\n\n' +
              'Please keep the following download link for your reference\n\n' +
              `${params.downloadUrl}?token=${sessionData?.sessionId}\n\n` +
              'You can also use this link to create new templates.\n\n' +
              'The link will be valid for 30 days from your first template purchase.\n\n' +
              'To get started, please see the following getting started guides:\n\n' +
              gettingStartedLinks,
          },
        },
      },
      Source: '"Goldstack" <hi@' + (await getFromDomain()) + '>',
    })
    .promise();

  await rmSafe(workspacePath);
};

export const putSessionHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, coupon, downloadUrl, projectId, packageId } = req.body;
    if (!email) {
      res.status(400).json({ errorMessage: 'Expected property email' });
      return;
    }
    const { userToken } = req.cookies;
    if (!userToken) {
      res
        .status(400)
        .json({ errorMessage: 'Expected userToken cookie to be set' });
      return;
    }
    const repo = await connectSessionRepository();
    const sessionData = await repo.readSession(userToken);
    if (!sessionData) {
      res.status(401).json({ errorMessage: 'Unknown session' });
      return;
    }
    if (new Date(sessionData.validUntil).getTime() < new Date().getTime()) {
      res.status(401).json({ errorMessage: 'Session expired' });
      return;
    }

    let validatedCoupon: string | undefined;
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
      const stripeId = await createSession({ projectId, packageId, email });
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
    res
      .status(500)
      .json({ errorMessage: `Cannot update session. ${e.message}` });
  }
};

export const postPurchase = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { projectId, downloadUrl, packageId } = req.body;
    const repo = await connectSessionRepository();
    const { userToken } = req.cookies;
    if (!userToken) {
      res
        .status(400)
        .json({ errorMessage: 'Expected userToken cookie to be set' });
      return;
    }
    const sessionData = await repo.readSession(userToken);
    if (!sessionData) {
      res.status(401).json({ errorMessage: 'Unknown session' });
      return;
    }
    if (new Date(sessionData.validUntil).getTime() < new Date().getTime()) {
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
        sessionData.sessionId
      );
      res.status(400).json({
        errorMessage:
          'Attempted to perform purchase for session for which no payment has been stored.',
      });
      return;
    }
    assert(sessionData.email);
    await performPurchase({
      userToken,
      email: sessionData.email,
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
    res
      .status(500)
      .json({ errorMessage: `Cannot process purchase ${e.message}` });
    return;
  }
};

router.post('/', postSessionHandler);
router.get('/', getSessionHandler);
router.put('/', putSessionHandler);
router.post('/purchase', postPurchase);

export default router;
