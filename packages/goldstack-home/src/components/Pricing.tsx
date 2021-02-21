import React from 'react';

import styled from 'styled-components';

import Header from 'src/components/Header';

import ModuleIcon from 'src/icons/modules.svg';
import DiamondIcon from 'src/icons/diamond.svg';
import TagAddIcon from 'src/icons/tag-add.svg';
import MoneyBackIcon from 'src/icons/money-back.svg';

import AngleRight from 'src/icons/font-awesome/solid/angle-right.svg';

interface PricingProps {
  title: string;
  actionLink: string;
  actionTitle: string;
}

import styles from './Pricing.module.css';
import Head from 'next/head';
import { dataUriToSrc } from 'src/utils/utils';
import Footer from './Footer';

const Pricing = (props: PricingProps): JSX.Element => {
  const angleRight = dataUriToSrc(AngleRight);
  return (
    <>
      <Head>
        <title>{props.title}</title>
      </Head>
      <Header></Header>
      <div className="container space-2">
        <div className="w-md-75 w-lg-50 text-center mx-md-auto mb-5 mb-md-9">
          <h2 className="h1">{props.title}</h2>
          <p>Completely free while we are in beta 💖</p>
        </div>

        <div className="row align-items-lg-center">
          <div id="stickyBlockStartPoint" className="col-lg-5 mb-9 mb-lg-0">
            <div className="card z-index-2 p-4 p-md-7">
              <span className="text-dark">
                <h3>1 Month Unlimited Templates</h3>
                <span
                  className="display-2"
                  style={{ textDecoration: 'line-through' }}
                >
                  $20
                </span>
                <span className="font-size-1">free while in beta</span>
              </span>

              <hr className="my-4" />

              <div className="mb-5">
                <p>
                  Create and download as many templates as you like for 30 days.
                </p>
              </div>

              <div className="mb-2">
                <a
                  className="btn btn-primary btn-pill btn-wide transition-3d-hover"
                  href={props.actionLink}
                >
                  {props.actionTitle}

                  <span
                    className={styles.arrowright}
                    dangerouslySetInnerHTML={{ __html: angleRight }}
                  ></span>
                </a>
              </div>

              {/* <p className="small">No credit card required.</p> */}
            </div>
          </div>

          <div className="col-lg-7">
            <div className="pl-lg-6">
              <div className="row">
                <div className="col-sm-6 mb-3">
                  <figure className="w-100 max-w-6rem mb-3">
                    <img className="img-fluid" src={ModuleIcon} alt="SVG" />
                  </figure>
                  <h4>Powerful Modules</h4>
                  <p>
                    Get started with exactly what you need by combining
                    Goldstack modules.
                  </p>
                </div>
                <div className="col-sm-6 mb-3">
                  <figure className="w-100 max-w-6rem mb-3">
                    <img className="img-fluid" src={DiamondIcon} alt="SVG" />
                  </figure>
                  <h4>Premium Quality</h4>
                  <p>
                    Templates that work and come with detailed documentation.
                  </p>
                </div>
              </div>

              <div className="row">
                <div className="col-sm-6 mb-3 mb-sm-0">
                  <figure className="w-100 max-w-6rem mb-3">
                    <img className="img-fluid" src={TagAddIcon} alt="SVG" />
                  </figure>
                  <h4>Unlimited Templates</h4>
                  <p>
                    Download as many templates as you like for the next 30 days.
                  </p>
                </div>
                {/*<div className="col-sm-6">
                  <figure className="w-100 max-w-6rem mb-3">
                    <img className="img-fluid" src={MoneyBackIcon} alt="SVG" />
                  </figure>
                  <h4>Money back</h4>
                  <p>100% money back guaranteed.</p>
  </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer></Footer>
    </>
  );
};

export default Pricing;
