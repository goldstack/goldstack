import React, { useRef, useState } from 'react';
import Link from 'next/link';

import assert from 'assert';

import Progress from './Progress';
import { getEndpoint } from '@goldstack/goldstack-api';
import Spinner from 'react-bootstrap/Spinner';

import { event } from './../lib/ga';
import * as Fullstory from '@fullstory/browser';

const MyLink: any = Link;

interface OneOffPurchaseProps {
  projectId: string;
  packageId: string;
  stripeId: string;
  onPurchaseComplete: () => void;
}

function validateEmail(email: string): boolean {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

const OneOffPurchase = (props: OneOffPurchaseProps): JSX.Element => {
  const emailInput = useRef<HTMLInputElement>(null);
  const couponInput = useRef<HTMLInputElement>(null);
  const termsInput = useRef<HTMLInputElement>(null);

  const [progressMessage, setProgressMessage] = useState('');

  const onSubmit = async (evt: any): Promise<void> => {
    evt.preventDefault();
    assert(emailInput.current);
    assert(couponInput.current);
    assert(termsInput.current);
    const email = emailInput.current.value;
    if (!email) {
      alert('Please enter an email address.');
      return;
    }
    if (!validateEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    if (!termsInput.current.value) {
      alert('Please accept our terms and conditions before proceeding.');
      return;
    }

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
        coupon: couponInput.current.value,
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

    if (couponInput.current.value && couponInput.current.value.length > 1) {
      event({
        action: 'single_purchase_coupon',
        category: 'projects',
        label: '',
        value: 0,
      });
    } else {
      event({
        action: 'single_purchase',
        category: 'projects',
        label: '',
        value: 20,
      });
    }
    props.onPurchaseComplete();
  };

  return (
    <form
      onSubmit={onSubmit}
      className="js-validate card border w-md-85 w-lg-100 mx-md-auto"
    >
      <div className="card-header bg-primary text-white text-center py-4 px-5 px-md-6">
        <h4 className="text-white mb-0">Single Purchase</h4>
      </div>

      <div className="card-body p-md-6">
        <div className="row">
          <div className="col-sm-12 mb-3">
            <div className="js-form-message form-group">
              <label htmlFor="emailAddress" className="input-label">
                Email address for template delivery
              </label>
              <input
                ref={emailInput}
                type="email"
                required
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
        <div className="row">
          <div className="col-sm-12 mb-3">
            <div className="js-form-message form-group">
              <label htmlFor="coupon" className="input-label">
                Coupon
              </label>
              <input
                ref={couponInput}
                type="text"
                className="form-control"
                name="coupon"
                id="coupon"
                placeholder="Optional coupon for purchase"
                aria-label="Coupon"
                data-msg="Provide an optional coupon"
              />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <div className="mb-5">
              <h2 className="font-size-1 text-body mb-0">Total price:</h2>
              {/* <span className="text-dark font-size-2 font-weight-bold">$0</span> */}
              <span className="text-body ml-2">$20</span>
            </div>
          </div>
        </div>
        <div className="js-form-message mb-5">
          <div className="custom-control custom-checkbox d-flex align-items-center text-muted">
            <input
              type="checkbox"
              ref={termsInput}
              className="custom-control-input"
              required
              id="termsCheckbox"
              name="termsCheckbox"
              data-msg="Please accept our Terms and Conditions."
            />
            <label className="custom-control-label" htmlFor="termsCheckbox">
              <small>
                I agree to the{' '}
                <MyLink href="/terms-and-conditions">
                  <a className="link-underline" target="_blank">
                    Terms and Conditions
                  </a>
                </MyLink>
              </small>
            </label>
          </div>
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
          <div className="col-sm-5 ">
            <button type="submit" className="btn btn-primary">
              <Spinner
                as="span"
                animation="border"
                role="status"
                size="sm"
                aria-hidden="true"
                hidden={!progressMessage}
              ></Spinner>{' '}
              Submit
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

export default OneOffPurchase;
