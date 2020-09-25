import React from 'react';

import styled from 'styled-components';

import useSWR from 'swr';

import CheckCircle from './../icons/font-awesome/solid/check-circle.svg';

import { dataUriToSrc } from 'src/utils/utils';
import { getEndpoint } from '@goldstack/goldstack-api';
interface DownloadProps {
  packageId: string;
  projectId: string;
}

const FontIcon = styled.div`
  svg {
    height: 5rem;
    vertical-align: text-top;
    margin: 1rem;
    stroke-width: 25;
    fill: #00c9a7;
  }
`;

const fetcher = (url: string): any =>
  fetch(url, {
    credentials: 'include',
  }).then((r) => r.json());

const DownloadReady = (props: { downloadUrl: string }): JSX.Element => {
  const checkCircle = dataUriToSrc(CheckCircle);
  return (
    <>
      <div className="container space-2">
        <div className="w-md-80 w-lg-50 text-center mx-md-auto">
          <FontIcon
            dangerouslySetInnerHTML={{ __html: checkCircle }}
          ></FontIcon>
          <div className="mb-5">
            <h1 className="h2">Ready to download!</h1>
            <p>
              Thank you for choosing Goldstack. Click the link below to download
              your project.
            </p>
          </div>
          <div>
            <a
              className="btn btn-primary btn-pill transition-3d-hover px-5"
              href={props.downloadUrl}
            >
              Download
            </a>
          </div>
          <div className="pt-3">
            <a
              className="btn btn-primary btn-pill transition-3d-hover px-5"
              href="/"
            >
              Create another template
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

const Download = (props: DownloadProps): JSX.Element => {
  const { data, error } = useSWR(
    `${getEndpoint()}/projects/${props.projectId}/packages/${props.packageId}`,
    fetcher
  );

  return (
    <>
      <div className="container space-2">
        <div className="w-md-80 w-lg-50 text-center mx-md-auto"></div>
        {error && <p>Something went wrong: {error + ''}</p>}
        {data && <DownloadReady downloadUrl={data.downloadUrl}></DownloadReady>}
      </div>
    </>
  );
};

export default Download;
