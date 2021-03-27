import React from 'react';

import { dataUriToSrc } from 'src/utils/utils';

import Plus from 'src/icons/font-awesome/solid/plus.svg';
import styles from './TemplateFeature.module.css';

import FeatureAWSDeployment from 'src/components/template/FeatureAWSDeployment';
import FeatureProjectInstall from 'src/components/template/FeatureProjectInstall';
import FeatureCombineTemplates from 'src/components/template/FeatureCombineTemplates';
import LearnMore from 'src/components/LearnMore';
import NextJsConfigGif from 'src/img/nextjs-config.gif';
import ReactTypeScriptGif from 'src/img/react-typescript.gif';
import VercelDeployedImg from 'src/img/vercel_deployed.png';
import LambdaConfigImg from 'src/img/lambda_config.png';
import EndpointTypeScript from 'src/img/endpoint_typescript.png';
import FeatureBootstrap from './FeatureBootstrap';

import TerraformIcon from 'src/icons/terraform.svg';
import ESLintIcon from 'src/icons/eslint.svg';
import JestIcon from 'src/icons/jestjs.svg';
import VSCodeIcon from 'src/icons/vscode.svg';
import YarnIcon from 'src/icons/yarn.svg';

import {
  TemplateFeatureProps,
  TemplateIcons,
} from '@goldstack/project-template-data';

const IconList = (props: { icons: TemplateIcons[] }): JSX.Element => {
  const resolvedIcons = resolveIcons(props.icons);
  const images = resolvedIcons.map((icon) => dataUriToSrc(icon));
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

const resolveIcons = (icons: TemplateIcons[]): any => {
  return icons.map((icon) => {
    switch (icon) {
      case 'eslint':
        return ESLintIcon;
      case 'terraform':
        return TerraformIcon;
      case 'jest':
        return JestIcon;
      case 'vscode':
        return VSCodeIcon;
      case 'yarn':
        return YarnIcon;
      default:
        throw new Error(`Unknown template icon: ${icon}`);
    }
  });
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

const createImage = (image: string): React.ReactNode => {
  if (image === 'vercel-deployed') {
    return <img src={VercelDeployedImg} className="img-fluid"></img>;
  }
  if (image === 'endpoint-typescript') {
    return <img src={EndpointTypeScript} className="img-fluid"></img>;
  }
  if (image === 'lambda-config') {
    return <img src={LambdaConfigImg} className="img-fluid"></img>;
  }
  throw new Error('Unknown image ' + image);
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
    case 'image': {
      content = createImage(props.content.data.image);
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
      content = (
        <FeatureProjectInstall
          projectName={props.content.data.projectName}
        ></FeatureProjectInstall>
      );
      break;
    }
    case 'bootstrap': {
      content = <FeatureBootstrap></FeatureBootstrap>;
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
            <h2 id={props.id || ''}>{props.title}</h2>
            <p>{props.description}</p>
          </div>

          <div className=" text-center mx-md-auto mb-5 mb-md-5">
            {content}
            {props.moreDetails && (
              <div className="w-md-80 w-lg-50 mx-md-auto text-center">
                <LearnMore {...props.moreDetails}></LearnMore>
              </div>
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
