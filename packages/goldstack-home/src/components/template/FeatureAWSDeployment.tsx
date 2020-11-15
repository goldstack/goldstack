import React from 'react';

const FeatureAWSDeployment = (): JSX.Element => {
  return (
    <>
      <div className="card bg-navy mb-5">
        <div className="card-body text-monospace font-size-1 p-6">
          <div className="mb-6">
            <span className="d-block text-white-70"> $ yarn infra up dev</span>
            <span className="d-block h4 text-success font-weight-normal">
              Development infrastructure set up!
            </span>
          </div>
          <div className="mb-6">
            <span className="d-block text-white-70"> $ yarn deploy dev</span>
            <span className="d-block h4 text-success font-weight-normal">
              App deployed to development infastructure!
            </span>
          </div>
          <div className="mb-0">
            <span className="d-block text-white-70"> $ yarn destroy dev</span>
            <span className="d-block h4 text-success font-weight-normal">
              Development infrastructure teared down.
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeatureAWSDeployment;
