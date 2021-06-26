import React from 'react';

import styled from 'styled-components';
import { dataUriToSrc } from 'src/utils/utils';
import CheckCircle from './../icons/font-awesome/solid/check-circle.svg';

const FontIcon = styled.div`
  svg {
    margin-top: 0.25rem;
    margin-left: 0.25rem;
    margin-right: 0.25rem;
    stroke-width: 25;
    height: 1rem;
    vertical-align: text-top;
    fill: #00c9a7;
  }
`;

const PurchaseDescription = (): JSX.Element => {
  const checkCircle = dataUriToSrc(CheckCircle);
  return (
    <>
      <div className="mb-5">
        <h2>Experience the difference with a premium template</h2>
        <p>
          Goldstack templates are carefully crafted and extensively tested to
          give your project solid foundations.
        </p>
      </div>

      <h4>Some of the key benefits:</h4>

      <div className="media text-body mb-3">
        <FontIcon
          dangerouslySetInnerHTML={{ __html: checkCircle }}
          className="mt-1 mr-2"
        ></FontIcon>
        <div className="media-body">
          Production-grade, serverless infrastrucure ready to roll out with
          Terraform on AWS
        </div>
      </div>
      <div className="media text-body mb-3">
        <FontIcon
          dangerouslySetInnerHTML={{ __html: checkCircle }}
          className="mt-1 mr-2"
        ></FontIcon>
        <div className="media-body">
          ESLint, TypeScript, Prettier and Yarn Workspaces configured with
          sensible defaults
        </div>
      </div>
      <div className="media text-body mb-3">
        <FontIcon
          dangerouslySetInnerHTML={{ __html: checkCircle }}
          className="mt-1 mr-2"
        ></FontIcon>
        <div className="media-body">
          All components designed for easy local testing.
        </div>
      </div>
    </>
  );
};

export default PurchaseDescription;
