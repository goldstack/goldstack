import React from 'react';

import AngleRight from 'src/icons/font-awesome/solid/angle-right.svg';
import { dataUriToSrc } from 'src/utils/utils';

import Plus from 'src/icons/font-awesome/solid/plus.svg';
import styles from './TemplateFeature.module.css';

import FeatureAWSDeployment from 'src/components/template/FeatureAWSDeployment';
import FeatureProjectInstall from 'src/components/template/FeatureProjectInstall';
import FeatureCombineTemplates from 'src/components/template/FeatureCombineTemplates';

import NextJsConfigGif from 'src/img/nextjs-config.gif';
import ReactTypeScriptGif from 'src/img/react-typescript.gif';
export interface CallToAction {
  title: string;
  link: string;
}

export interface MoreDetails {
  description: string;
  link?: string;
}

export interface FeatureContent {
  type: string;
  data: any;
}

export interface TemplateFeatureProps {
  title: string;
  description: string;
  moreDetails?: MoreDetails;
  callToAction?: CallToAction;
  content: FeatureContent;
  icons?: any[];
}

const LearnMore = (props: MoreDetails): JSX.Element => {
  const angleRight = dataUriToSrc(AngleRight);
  return (
    <div className="text-center mb-7 mt-5">
      <p>
        {props.description} <span></span>
        {props.link && (
          <a className="font-weight-bold" href={props.link}>
            Learn more
            <span
              className={styles['angle-right']}
              dangerouslySetInnerHTML={{ __html: angleRight }}
            ></span>
          </a>
        )}
      </p>
    </div>
  );
};

const IconList = (props: { icons: any[] }): JSX.Element => {
  const images = props.icons.map((icon) => dataUriToSrc(icon));
  return (
    <>
      <div className="row justify-content-center">
        {images.map((image, idx) => (
          <div className={'col-4 col-sm-3 my-2 '} key={idx}>
            <figure
              dangerouslySetInnerHTML={{ __html: image }}
              className={styles['icon']}
            ></figure>
          </div>
        ))}
      </div>
    </>
  );
};

const createGif = (gif: string): React.ReactNode => {
  if (gif === 'nextjs-config') {
    return <img src={NextJsConfigGif}></img>;
  }
  if (gif === 'react-typescript') {
    return <img src={ReactTypeScriptGif}></img>;
  }
  throw new Error('Unknown gif ' + gif);
};

const TemplateFeature = (props: TemplateFeatureProps): JSX.Element => {
  const plusSvg = dataUriToSrc(Plus);

  let content: React.ReactNode;
  switch (props.content.type) {
    case 'none': {
      content = <></>;
      break;
    }
    case 'gif': {
      content = createGif(props.content.data.gif);
      break;
    }
    case 'aws-deployment': {
      content = <FeatureAWSDeployment></FeatureAWSDeployment>;
      break;
    }
    case 'combine-templates': {
      content = (
        <FeatureCombineTemplates
          templates={props.content.data.templates}
        ></FeatureCombineTemplates>
      );
      break;
    }
    case 'project-install': {
      content = <FeatureProjectInstall></FeatureProjectInstall>;
      break;
    }
    default: {
      throw new Error('Unknown feature content type ' + props.content.type);
    }
  }

  return (
    <>
      <div className="position-relative gradient-y-gray">
        <div className="container space-2 space-bottom-sm-3">
          <div className="w-md-80 w-lg-50 text-center mx-md-auto mb-5 mb-md-5">
            <h2>{props.title}</h2>
            <p>{props.description}</p>
          </div>

          <div className="w-md-80 w-lg-50 mx-md-auto mb-5 mb-md-5">
            {content}
            {props.moreDetails && (
              <LearnMore {...props.moreDetails}></LearnMore>
            )}

            {props.icons && <IconList icons={props.icons}></IconList>}
          </div>

          {props.callToAction && (
            <div className="text-center">
              <a
                className="btn btn-primary transition-3d-hover px-lg-7"
                href={props.callToAction.link}
                // target="_blank"
                // rel="noreferrer"
              >
                <span
                  className={styles['plus-icon']}
                  dangerouslySetInnerHTML={{ __html: plusSvg }}
                ></span>{' '}
                {props.callToAction.title}
              </a>
            </div>
          )}
        </div>

        <figure className="position-absolute bottom-0 right-0 left-0">
          <svg
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 1920 100.1"
          >
            <path fill="#fff" d="M0,0c0,0,934.4,93.4,1920,0v100.1H0L0,0z" />
          </svg>
        </figure>
      </div>
    </>
  );
};

export default TemplateFeature;
