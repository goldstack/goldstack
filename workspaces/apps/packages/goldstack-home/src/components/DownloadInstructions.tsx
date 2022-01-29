import AngleRight from './../icons/font-awesome/solid/angle-right.svg';

import React from 'react';
import styles from './DownloadInstructions.module.css';
import { dataUriToSrc } from 'src/utils/utils';
import { DownloadInstructionsStep } from './DownloadInstructionsStep';

export const AngleRightComponent = (): JSX.Element => {
  const angleRight = dataUriToSrc(AngleRight);
  return (
    <span
      className={styles['angle-right']}
      dangerouslySetInnerHTML={{ __html: angleRight }}
    ></span>
  );
};

export const DownloadInstructions = (props: {
  projectId: string;
  packageId: string;
  downloadUrl: string;
}): JSX.Element => {
  return (
    <>
      <div>
        <div className="position-relative z-index-2 text-center">
          <div className="d-inline-block font-size-1 border bg-white text-center rounded-pill py-3 px-4">
            Any problems?{' '}
            <a
              className="font-weight-bold ml-3"
              href="https://github.com/goldstack/goldstack/issues"
            >
              Open an issue on GitHub 🤗 <AngleRightComponent />
            </a>
          </div>
        </div>
      </div>
      <DownloadInstructionsStep stepNumber={1} title="Configure AWS Deployment">
        <p>
          Define how your project should be deployed to the cloud, such as the
          domain name for your website.
        </p>
        <div className="font-size-1">
          <span>Skip this step if you do not want to deploy your project.</span>
        </div>
        <div className="mb-3 mt-3">
          <a
            className="btn btn-outline-primary btn-pill transition-3d-hover px-5"
            href={`/projects/${props.projectId}/packages/${props.packageId}/configure/1`}
          >
            Configure AWS Deployment
          </a>
        </div>
      </DownloadInstructionsStep>
      <DownloadInstructionsStep stepNumber={2} title="Download project">
        <p>Get the ZIP file that contains your generated project.</p>
        <div className="mb-3 mt-3">
          <a
            className="btn btn-primary btn-pill transition-3d-hover px-5"
            href={props.downloadUrl}
          >
            Download Project Package
          </a>
        </div>
      </DownloadInstructionsStep>
      <DownloadInstructionsStep
        stepNumber={3}
        title="Extract project and open in VSCode"
      >
        <p>
          Extract the ZIP file and move the extracted files to a folder where
          you want to store your code. Open that folder in VSCode.
        </p>
        <img></img>
      </DownloadInstructionsStep>
    </>
  );
};
