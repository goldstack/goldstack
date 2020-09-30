import React from 'react';

import styles from './Download.module.css';

import useSWR from 'swr';

import CheckCircle, {
  link,
} from './../icons/font-awesome/solid/check-circle.svg';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { dataUriToSrc } from 'src/utils/utils';
import { getEndpoint } from '@goldstack/goldstack-api';
import { DocLink } from '@goldstack/goldstack-api/dist/src/utils/docLinks';
interface DownloadProps {
  packageId: string;
  projectId: string;
}

const fetcher = (url: string): any =>
  fetch(url, {
    credentials: 'include',
  }).then((r) => r.json());

const DownloadReady = (props: { downloadUrl: string }): JSX.Element => {
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

const DocLinkItem = (props: { link: DocLink }): JSX.Element => {
  return (
    <a className="card card-frame py-3 px-4 mb-3" href={props.link.link}>
      <div className="row align-items-sm-center">
        <span className="col-sm-9 text-dark">{props.link.packageName}</span>
        <span className="col-6 col-sm-3 text-right">
          Open <i className="fas fa-angle-right fa-sm ml-1"></i>
        </span>
      </div>
    </a>
  );
};

const DocsLinks = (props: { data: DocLink[] }): JSX.Element => {
  return (
    <>
      <div className="w-lg-65 text-center mx-auto mb-4">
        <h3 className="h3">Getting Started 🚀</h3>
        <p>
          Please see the following guides to help with first steps for your
          project and the selected modules:
        </p>
      </div>
      <div className="text-center">
        <div className="mb-2">
          <a
            href="https://docs.goldstack.party/docs/goldstack/getting-started"
            target="_blank"
            rel="noreferrer"
          >
            Project Setup
          </a>
        </div>
        {props.data.map((docLink, idx) => (
          <div key={idx} className="mb-2">
            <a
              href={docLink.link}
              target="_blank"
              rel="noreferrer"
            >{`${docLink.packageName} Module`}</a>
          </div>
          // <DocLinkItem link={docLink} key={idx}></DocLinkItem>
        ))}
      </div>
    </>
  );
};

const Download = (props: DownloadProps): JSX.Element => {
  const { data: endpointData, error: endpointError } = useSWR(
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

  return (
    <>
      <div className="container space-2">
        <Row>
          <Col lg={12} md={12}>
            {endpointError && <p>Something went wrong: {endpointError + ''}</p>}
            {endpointData && (
              <DownloadReady
                downloadUrl={endpointData.downloadUrl}
              ></DownloadReady>
            )}
          </Col>
        </Row>
        <Row>
          <Col lg={12} md={12}>
            {docsData && <DocsLinks data={docsData}></DocsLinks>}
          </Col>
        </Row>
      </div>
    </>
  );
};

export default Download;
