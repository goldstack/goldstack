import React from 'react';
import type { LandingAction } from '@goldstack/template-metadata';

const TemplateCallToAction = (props: { action: LandingAction }): JSX.Element => {
  return (
    <>
      <div className="container space-2">
        <div
          className="text-center py-6"
          style={{
            background: 'url(/static/images/abstract-shapes-19.svg) center no-repeat',
          }}
        >
          <h2>Unleash Your Creativity and Build with Joy</h2>
          <p>
            Design your customized starter project with Goldstack, download a ZIP and start coding.
          </p>
          <span className="d-block mt-5">
            {props.action && (
              <div className="mt-4">
                <a
                  className="btn btn-primary btn-wide transition-3d-hover"
                  href={props.action.link}
                >
                  {props.action.title}
                </a>
              </div>
            )}
          </span>
        </div>
      </div>
    </>
  );
};

export default TemplateCallToAction;
