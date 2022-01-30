import AngleRight from './../icons/font-awesome/solid/angle-right.svg';

import React from 'react';
import styles from './DownloadInstructions.module.css';
import { dataUriToSrc } from 'src/utils/utils';
import { DocLink } from '@goldstack/goldstack-api/dist/src/utils/docLinks';
import { DownloadInstructionsStep } from './DownloadInstructionsStep';

const AngleRightComponent = (): JSX.Element => {
  const angleRight = dataUriToSrc(AngleRight);
  return (
    <span
      className={styles['angle-right']}
      dangerouslySetInnerHTML={{ __html: angleRight }}
    ></span>
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
      <p>
        Also see the following guides for more information on project setup and
        documentation for the specific modules you have selected:
      </p>
      <div>
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

export const DownloadInstructions = (props: {
  projectId: string;
  packageId: string;
  downloadUrl: string;
  docLinks: DocLink[] | undefined;
}): JSX.Element => {
  return (
    <>
      <div>
        <div className="position-relative z-index-2 text-center">
          <div className="d-inline-block font-size-1 border bg-white text-center rounded-pill py-3 px-4">
            Any problems?{' '}
            <a
              className="font-weight-bold ml-3"
              target="_blank"
              rel="noreferrer"
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
          <span>
            ℹ️ Skip this step if you do not want to deploy your project on AWS.
          </span>
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
      <DownloadInstructionsStep stepNumber={3} title="Extract project">
        <p>
          Extract the ZIP file and move the extracted files to a folder where
          you want to store your code.
        </p>
        <img
          className="img-fluid"
          src="https://cdn.goldstack.party/img/202201/extract_project.gif"
        ></img>
      </DownloadInstructionsStep>
      <DownloadInstructionsStep
        stepNumber={4}
        title="Open extracted folder in VSCode"
      >
        <p>
          Open VSCode and go to <i>File / Open Folder</i> to open the folder you
          have extracted.
        </p>
        <img
          className="img-fluid mb-4"
          src="https://cdn.goldstack.party/img/202201/open_folder.png"
        ></img>
        <p>
          VSCode may prompt you to ask if you trust the authors of the
          workspace. Respond with <i>Yes</i>.
        </p>
        <img
          className="img-fluid mb-4"
          style={{ maxWidth: '500px' }}
          src="https://cdn.goldstack.party/img/202201/trust_authors.png"
        ></img>
        <p>
          You may also be asked if you want to install recommended extensions
          for this workspace. We recommend to do so since the template will be
          optimised to work with the suggested extensions.
        </p>
        <img
          className="img-fluid mb-4"
          src="https://cdn.goldstack.party/img/202201/install_extensions.png"
        ></img>
      </DownloadInstructionsStep>
      <DownloadInstructionsStep
        stepNumber={5}
        title="Install project dependencies and build project"
      >
        <p>
          Open the terminal in VSCode by going to <i>Terminal / New Terminal</i>
          . Run the following command:
        </p>
        <pre>{'yarn && yarn build'}</pre>
        <img
          className="img-fluid"
          src="https://cdn.goldstack.party/img/202201/yarn_build.gif"
        ></img>
      </DownloadInstructionsStep>

      <DownloadInstructionsStep stepNumber={6} title="Initialise TypeScript">
        <p>
          Locate a <code>.ts</code> or <code>.tsx</code> file in the workspace
          and open it. When asked whether to use the workspace TypeScript
          version, click <i>Allow</i>.
        </p>
        <img
          className="img-fluid"
          src="https://cdn.goldstack.party/img/202201/allow_typescript.gif"
        ></img>
      </DownloadInstructionsStep>

      <DownloadInstructionsStep
        stepNumber={7}
        title="Start working with the project"
      >
        <p>
          You should now be all set to start working with the project. A good
          starting point is usually to open a terminal in one of the{' '}
          <code>packages</code> and run the <code>yarn watch</code> command to
          get started with some local testing.
        </p>
        <img
          className="img-fluid mb-4"
          src="https://cdn.goldstack.party/img/202201/yarn_watch.gif"
        ></img>
        {props.docLinks && <DocsLinks data={props.docLinks}></DocsLinks>}
      </DownloadInstructionsStep>

      <div>
        <div className="position-relative z-index-2 text-center space-2">
          <div className="d-inline-block font-size-1 border bg-white text-center rounded-pill py-3 px-4">
            Any problems or ideas for improvements?{' '}
            <a
              className="font-weight-bold ml-3"
              target="_blank"
              rel="noreferrer"
              href="https://github.com/goldstack/goldstack/issues"
            >
              Open an issue on GitHub 🤗 <AngleRightComponent />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};
