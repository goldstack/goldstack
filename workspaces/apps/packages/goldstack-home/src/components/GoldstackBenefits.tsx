import React from 'react';

import Icon23 from './../icons/front/icon-23.svg';
import Icon3 from './../icons/front/icon-3.svg';
import Icon5 from './../icons/front/icon-5.svg';
import Icon2 from './../icons/front/icon-2.svg';

const GoldstackBenefits = (): JSX.Element => {
  return (
    <>
      <div className="container space-2">
        <div className="w-md-75 w-lg-50 text-center mx-md-auto mb-5 mb-md-9">
          <h2 className="h2">Key Benefits</h2>
          <p>
            Get started faster and enjoy the benefits of high quality components for the whole
            lifecycle of your application.
          </p>
        </div>

        <div className="row mx-n2">
          <div className="col-sm-6 col-lg-3 px-2 mb-3 mb-lg-0">
            <a
              className="card h-100 transition-3d-hover"
              href={`${process.env.NEXT_PUBLIC_GOLDSTACK_DOCS}/goldstack/about`}
            >
              <div className="card-body">
                <figure className="w-100 max-w-8rem mb-4">
                  <img className="img-fluid" src={Icon23} alt="SVG" />
                </figure>
                <h4>Excellent Components</h4>
                <p className="font-size-1 text-body mb-0">
                  We choose only the best frameworks and solutions for our templates.
                </p>
              </div>
              <div className="card-footer border-0 pt-0">
                <span className="font-size-1">
                  Learn more <i className="fas fa-angle-right fa-sm ml-1"></i>
                </span>
              </div>
            </a>
          </div>

          <div className="col-sm-6 col-lg-3 px-2 mb-3 mb-lg-0">
            <a className="card h-100 transition-3d-hover" href="/build">
              <div className="card-body">
                <figure className="w-100 max-w-8rem mb-4">
                  <img className="img-fluid" src={Icon3} alt="SVG" />
                </figure>
                <h4>Customizable</h4>
                <p className="font-size-1 text-body mb-0">
                  Goldstack provides powerful tools to customize our templates to your needs.
                </p>
              </div>
              <div className="card-footer border-0 pt-0">
                <span className="font-size-1">
                  Learn more <i className="fas fa-angle-right fa-sm ml-1"></i>
                </span>
              </div>
            </a>
          </div>

          <div className="col-sm-6 col-lg-3 px-2">
            <a
              className="card h-100 transition-3d-hover"
              href={process.env.NEXT_PUBLIC_GOLDSTACK_DOCS}
            >
              <div className="card-body">
                <figure className="w-100 max-w-8rem mb-4">
                  <img className="img-fluid" src={Icon2} alt="SVG" />
                </figure>
                <h4>Documentation</h4>
                <p className="font-size-1 text-body mb-0">
                  Detailed documentation and getting started guides for every template.
                </p>
              </div>
              <div className="card-footer border-0 pt-0">
                <span className="font-size-1">
                  Learn more <i className="fas fa-angle-right fa-sm ml-1"></i>
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default GoldstackBenefits;
