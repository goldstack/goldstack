import React, { useRef, useState } from 'react';
import Link from 'next/link';

import assert from 'assert';

import Progress from './Progress';
import { getEndpoint } from '@goldstack/goldstack-api';
import Spinner from 'react-bootstrap/Spinner';

import { event } from '../lib/ga';
import * as Fullstory from '@fullstory/browser';

interface ConfigureSessionProps {
  projectId: string;
  packageId: string;
  stripeId: string;
  onConfigurationComplete: () => void;
}

function validateEmail(email: string): boolean {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

const ConfigureSession = (props: ConfigureSessionProps): JSX.Element => {
  const emailInput = useRef<HTMLInputElement>(null);

  const [progressMessage, setProgressMessage] = useState('');

  const onSubmit = async (evt: any): Promise<void> => {
    evt.preventDefault();
    let email: string;
    if (emailInput.current) {
      email = emailInput.current.value;
      if (email && !validateEmail(email)) {
        alert('Please enter a valid email address.');
        return;
      }
    } else {
      email = '';
    }
    // if (!termsInput.current.value) {
    //   alert('Please accept our terms and conditions before proceeding.');
    //   return;
    // }

    setProgressMessage('Processing ...');
    const sessionRes = await fetch(`${getEndpoint()}/sessions`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify({
        email: email,
        stripeId: props.stripeId,
        projectId: props.projectId,
        packageId: props.packageId,
        downloadUrl: `https://${window.location.hostname}/projects/${props.projectId}/packages/${props.packageId}/download`,
        coupon: 'FREEBETA',
      }),
    });
    if (
      sessionRes.status === 400 &&
      (await sessionRes.json()).error === 'invalid-coupon'
    ) {
      alert('Invalid coupon');
      setProgressMessage('');
      return;
    } else if (sessionRes.status !== 200) {
      throw new Error('Cannot submit payment information');
    }

    try {
      if (process.env.GOLDSTACK_DEPLOYMENT === 'prod') {
        Fullstory.setUserVars({
          displayName: email,
          email: email,
        });
      }
    } catch (e) {
      console.warn(e);
      console.warn('Cannot configure FullStory user.');
    }

    event({
      action: 'single_purchase',
      category: 'projects',
      label: '',
      value: 20,
    });
    props.onConfigurationComplete();
  };

  return (
    <form
      onSubmit={onSubmit}
      className="js-validate card border w-md-85 w-lg-100 mx-md-auto"
    >
      <div className="card-header bg-primary text-white text-center py-4 px-5 px-md-6">
        <h4 className="text-white mb-0">Template Delivery</h4>
      </div>

      <div className="card-body p-md-6">
        <div className="row">
          <div className="col-sm-12 mb-3">
            <p>
              If you provide your email address, we will send a link with your
              generated template for safekeeping and inform about important
              updates for your template.
            </p>
            <div className="js-form-message form-group">
              <label htmlFor="emailAddress" className="input-label">
                Your email address
              </label>
              <input
                ref={emailInput}
                type="email"
                className="form-control"
                name="emailAddress"
                id="emailAddress"
                placeholder="Email address"
                aria-label="Email address"
                data-msg="Please enter a valid email address"
              />
            </div>
          </div>
        </div>{' '}
        <div className="js-form-message mb-5">
          <small>
            Goldstack templates are open source. See our{' '}
            <a
              href="/terms-and-conditions"
              className="link-underline"
              target="_blank"
            >
              Terms and Conditions
            </a>{' '}
            for our privacy policy.
          </small>
        </div>
        <div className="row align-items-center">
          {/* <div className="col-sm-7 mb-3 mb-sm-0">
            <p className="font-size-1 text-muted mb-0">
              Already have an account?{' '}
              <a className="font-weight-bold" href="#">
                Log In
              </a>
            </p>
          </div> */}
          <div className="col-sm-10 " style={{ display: 'flex' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!!progressMessage}
            >
              <Spinner
                as="span"
                animation="border"
                role="status"
                size="sm"
                aria-hidden="true"
                hidden={!progressMessage}
              ></Spinner>{' '}
              Proceed with Email
            </button>
            <button
              type="submit"
              className="btn btn-ghost-secondary"
              disabled={!!progressMessage}
            >
              <Spinner
                as="span"
                animation="border"
                role="status"
                size="sm"
                aria-hidden="true"
                hidden={!progressMessage}
              ></Spinner>{' '}
              Proceed without Email
            </button>
          </div>
          <div className="cols-sm-2">
            <Progress progressMessage={progressMessage || ''}></Progress>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ConfigureSession;
