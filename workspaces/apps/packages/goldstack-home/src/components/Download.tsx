import React from 'react';

import styles from './Download.module.css';
import Head from 'next/head';
import useSWR from 'swr';

import CheckCircle from './../icons/font-awesome/solid/check-circle.svg';

import Footer from 'src/components/Footer';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { dataUriToSrc } from 'src/utils/utils';
import { getEndpoint } from '@goldstack/goldstack-api';
import type { DocLink } from '@goldstack/goldstack-api/dist/src/utils/docLinks';

import assert from 'assert';
import { loadStripe } from '@stripe/stripe-js';
import { DownloadInstructions } from './DownloadInstructions';

assert(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_API_KEY,
  'Environment variable NEXT_PUBLIC_STRIPE_PUBLIC_API_KEY must be defined.'
);

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_API_KEY);

interface DownloadProps {
  packageId: string;
  projectId: string;
}

const fetcher = (url: string): any =>
  fetch(url, {
    credentials: 'include',
  }).then((r) => r.json());

const DownloadReady = (props: {
  downloadUrl: string;
  projectId: string;
  packageId: string;
  docLinks: DocLink[] | undefined;
}): JSX.Element => {
  const checkCircle = dataUriToSrc(CheckCircle);
  return (
    <>
      <div className="container space-2">
        <div className="w-md-80 text-center mx-md-auto">
          <div
            className={styles.check}
            dangerouslySetInnerHTML={{ __html: checkCircle }}
          ></div>
          <div className="mb-5">
            <h1 className="h2">Project successfully generated</h1>
            <p>Follow the steps below to setup your project.</p>
          </div>
        </div>

        <DownloadInstructions
          packageId={props.packageId}
          downloadUrl={props.downloadUrl}
          projectId={props.projectId}
          docLinks={props.docLinks}
        ></DownloadInstructions>
      </div>
    </>
  );
};

const Download = (props: DownloadProps): JSX.Element => {
  const { data: packageData, error: packageDataError } = useSWR(
    `${getEndpoint()}/projects/${props.projectId}/packages/${props.packageId}`,
    fetcher
  );

  const { data: docsData, error: docsError } = useSWR(
    `${getEndpoint()}/projects/${props.projectId}/docs?linksOnly=true`,
    fetcher
  );

  if (docsError) {
    console.error('Cannot load documentation for project', props.projectId);
  }

  if (packageData && packageData.error === 'not-paid') {
    if (!packageData.stripeId) {
      throw new Error('Invalid session');
    }

    const redirectToStripe = async (): Promise<void> => {
      const stripe = await stripePromise;
      assert(stripe);
      const result = await stripe.redirectToCheckout({
        sessionId: packageData.stripeId,
      });
      if (result.error) {
        throw new Error('Cannot redirect to Stripe checkout.');
      }
    };
    redirectToStripe();
    return <></>;
  }

  return (
    <>
      <Head>
        <title>Download</title>
      </Head>
      <div className="container space-2" style={{ minHeight: '1000px' }}>
        <Row>
          <Col lg={12} md={12}>
            {packageDataError && (
              <p>Something went wrong: {packageDataError + ''}</p>
            )}
            {packageData && (
              <DownloadReady
                projectId={props.projectId}
                packageId={props.packageId}
                downloadUrl={packageData.downloadUrl}
                docLinks={docsData}
              ></DownloadReady>
            )}
          </Col>
        </Row>
      </div>

      <Footer></Footer>
    </>
  );
};

export default Download;
