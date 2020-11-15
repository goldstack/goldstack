import React from 'react';

const TemplateCallToAction = (): JSX.Element => {
  return (
    <>
      <div className="container space-2">
        <div
          className="text-center py-6"
          style="background: url(../../assets/svg/components/abstract-shapes-19.svg) center no-repeat;"
        >
          <h2>Find the right learning path for you</h2>
          <p>Answer a few questions and match your goals to our programs.</p>
          <span className="d-block mt-5">
            <a className="btn btn-primary transition-3d-hover" href="#">
              Explore by Category
            </a>
          </span>
        </div>
      </div>
    </>
  );
};

export default TemplateCallToAction;
